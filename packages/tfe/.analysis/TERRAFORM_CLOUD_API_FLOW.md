# Terraform Cloud API Flow Overview

This document provides a comprehensive breakdown of the Terraform Cloud API flow based on analysis of captured HTTP traffic from Terraform CLI operations.

## Overview of API Call Volumes

The analysis covers 4 scenarios with varying complexity:
- **SUCCESS**: 58 API calls
- **POLICY_FAILURE**: 158 calls
- **NO_CHANGES**: 204 calls
- **AZ_POLICY_ERROR**: 263 calls

---

## Core Workflow Pattern (SUCCESS scenario)

### 1. Initialization Phase (13 calls)

The CLI starts by authenticating and discovering the workspace:

```
GET /.well-known/terraform.json          → Discover service endpoints
GET /api/v2/ping                         → Health check (204 No Content)
GET /api/v2/organizations/{org}/entitlement-set  → Check organization permissions
GET /api/v2/organizations/{org}/workspaces/{workspace} → Get workspace details
GET /api/v2/workspaces/{ws-id}/current-state-version  → Retrieve current state
```

**Pattern**: This initialization sequence repeats 2-3 times (likely for different operations: init, plan, apply).

---

### 2. Configuration Upload Phase (4 calls)

```http
POST /api/v2/workspaces/{ws-id}/configuration-versions
Content-Type: application/vnd.api+json

Request Body:
{
  "data": {
    "type": "configuration-versions",
    "attributes": {
      "auto-queue-runs": false,
      "provisional": false,
      "speculative": true/false  ← true for plan, false for apply
    }
  }
}

Response:
{
  "data": {
    "type": "configuration-versions",
    "id": "cv-xxx",
    "attributes": {
      "status": "pending",
      "speculative": true/false
    }
  }
}
```

Then poll for upload completion:
```
GET /api/v2/configuration-versions/{cv-id}  → Poll until status = "uploaded"
```

**Key distinction**: The CLI uploads configuration twice:
- **First upload**: `"speculative": true` (for planning/preview)
- **Second upload**: `"speculative": false` (for actual apply)

---

### 3. Run Creation Phase (2 calls)

```http
POST /api/v2/runs
Content-Type: application/vnd.api+json

Request Body:
{
  "data": {
    "type": "runs",
    "attributes": {
      "auto-apply": false,
      "refresh": true,
      "save-plan": false,
      "variables": []
    },
    "relationships": {
      "configuration-version": {
        "data": {
          "type": "configuration-versions",
          "id": "cv-xxx"
        }
      }
    }
  }
}

Response:
{
  "data": {
    "type": "runs",
    "id": "run-xxx",
    "attributes": {
      "status": "pending",
      "auto-apply": false
    }
  }
}
```

**Note**: Creates two runs - one speculative (plan), one real (apply).

---

### 4. Planning Phase (27 calls) - Heavy Polling

```
GET /api/v2/runs/{run-id}/run-events  → Get run events/logs
GET /api/v2/runs/{run-id}             → Poll run status
```

**Run status progression**:
```
pending → plan_queued → post_plan_running → post_plan_completed
```

**Note**: Speculative runs end with `planned_and_finished` instead of `post_plan_completed`.

**Plan status polling**:
```
GET /api/v2/plans/{plan-id}           → Poll plan status
```

**Plan status progression**:
```
agent_queued → running → finished
```

**Get plan output**:
```
GET /api/v2/plans/{plan-id}/json-output-redacted  → Get plan JSON (307 redirect)
```

---

### 5. Policy Evaluation Phase (6 calls)

```
GET /api/v2/task-stages/{ts-id}
```

**Status progression**:
```
running → passed/failed
```

**Get policy results**:
```
GET /api/v2/policy-evaluations/{poleval-id}/policy-set-outcomes
```

**Key difference in POLICY_FAILURE scenario**:
- Task stage status becomes `"failed"` instead of `"passed"`
- Run status becomes `"policy_checked"` or stays in `"post_plan_running"`
- Apply phase is never triggered

---

### 6. Apply Phase (4 calls)

**Trigger apply**:
```http
POST /api/v2/runs/{run-id}/actions/apply
Content-Type: application/vnd.api+json

Response: 202 Accepted
```

**Verify apply started**:
```
GET /api/v2/runs/{run-id}  → Verify status changed to "apply_queued"
```

**Poll apply status**:
```
GET /api/v2/applies/{apply-id}  → Poll apply status
```

**Apply status progression**:
```
agent_queued → finished/errored
```

**Note**: In the captured traffic, applies transition directly from `agent_queued` to `finished` or `errored` without an observed intermediate `running` state.

**Final run status**:
- `"applied"` (success)
- `"errored"` (failure)

---

## Key API Patterns

### 1. Polling Pattern
The CLI heavily uses polling to track async operations:
- Run status changes
- Plan execution
- Policy evaluation
- Apply execution

**Typical pattern**: Repeated GET requests until status reaches terminal state.

### 2. JSON:API Format
All requests/responses use [JSON:API specification](https://jsonapi.org/):

```json
{
  "data": {
    "type": "resource-type",
    "id": "resource-id",
    "attributes": { ... },
    "relationships": { ... }
  }
}
```

### 3. Important Headers
```
Content-Type: application/vnd.api+json
Authorization: Bearer {token}
```

### 4. State Download
```
GET /api/state-versions/{sv-id}/hosted_state  → 302 redirect to S3/storage
```

The actual state file is stored externally and accessed via redirect.

### 5. Module Registry (observed in AZ_POLICY_ERROR scenario)
```
GET /api/registry/v1/modules/{org}/{name}/{provider}/versions
GET /api/registry/v1/modules/{org}/{name}/{provider}/{version}/download
```

---

## Critical Status Values

### Run Statuses (Sequential Flow)
```
pending
  ↓
plan_queued
  ↓
post_plan_running
  ↓
post_plan_completed (or planned_and_finished for speculative runs)
  ↓
apply_queued (only for non-speculative runs)
  ↓
applied (success) | errored (failure)
```

**Alternative paths**:
- Policy failure: Run may transition to other states when policy checks fail
- Speculative runs: End at `planned_and_finished` (no apply phase)

### Plan Statuses
```
pending → agent_queued → running → finished
```

### Apply Statuses
```
agent_queued → finished (success) | errored (failure)
```

### Task Stage (Policy) Statuses
```
running → passed | failed
```

---

## Workflow State Machine

```
[Initialize]
    ↓
[Upload Configuration - Speculative]
    ↓
[Create Speculative Run]
    ↓
[Poll Plan Status]
    ↓
[Evaluate Policies]
    ↓
[Upload Configuration - Non-Speculative]
    ↓
[Create Real Run]
    ↓
[Poll Plan Status]
    ↓
[Evaluate Policies]
    ↓
[Trigger Apply] ← Only if policies pass
    ↓
[Poll Apply Status]
    ↓
[Complete]
```

---

## Recommendations for Recreating the API

### 1. Core Endpoints to Implement

**Discovery & Authentication**:
- `GET /.well-known/terraform.json`
- `GET /api/v2/ping`

**Organization & Workspace**:
- `GET /api/v2/organizations/{org}/entitlement-set`
- `GET /api/v2/organizations/{org}/workspaces/{workspace}`
- `GET /api/v2/organizations/{org}/projects`

**Configuration Management**:
- `POST /api/v2/workspaces/{id}/configuration-versions`
- `GET /api/v2/configuration-versions/{id}`

**Run Management**:
- `POST /api/v2/runs`
- `GET /api/v2/runs/{id}`
- `GET /api/v2/runs/{id}/run-events`
- `POST /api/v2/runs/{id}/actions/apply`

**Plan Management**:
- `GET /api/v2/plans/{id}`
- `GET /api/v2/plans/{id}/json-output-redacted`

**Apply Management**:
- `GET /api/v2/applies/{id}`

**Policy Evaluation**:
- `GET /api/v2/task-stages/{id}`
- `GET /api/v2/policy-evaluations/{id}/policy-set-outcomes`

**State Management**:
- `GET /api/v2/workspaces/{id}/current-state-version`
- `GET /api/state-versions/{id}/hosted_state`

**Module Registry** (optional):
- `GET /api/registry/v1/modules/{org}/{name}/{provider}/versions`
- `GET /api/registry/v1/modules/{org}/{name}/{provider}/{version}/download`

### 2. Implementation Guidelines

#### Async State Machines
Support async state machines for:
- **Runs**: pending → plan_queued → post_plan_running → post_plan_completed → apply_queued → applied/errored
- **Plans**: agent_queued → running → finished
- **Applies**: agent_queued → finished/errored

#### Polling-Friendly Design
- Status updates should be queryable via GET
- Idempotent GET requests
- No side effects on status polling

#### JSON:API Compliance
Use JSON:API spec for consistent request/response format:
- Resource type and ID in data envelope
- Attributes for properties
- Relationships for linked resources

#### Speculative vs. Non-Speculative Runs
Key differentiator:
- **Speculative runs**: Preview/plan only, `"speculative": true`
- **Non-speculative runs**: Can be applied, `"speculative": false`

#### Policy Evaluation Hooks
Implement policy checks after planning:
- Task stages that execute policies
- Ability to block apply based on policy failures
- Policy outcomes endpoint for detailed results

#### Configuration Upload
Support uploading Terraform configuration:
- Accept tarball/zip of configuration
- Track upload status
- Link configuration to runs

---

## Scenario Comparisons

### SUCCESS vs POLICY_FAILURE

**Policy Failure Differences**:
- Task stage status: `"failed"` instead of `"passed"`
- No apply phase triggered
- More API calls due to multiple workspaces being processed

### NO_CHANGES vs SUCCESS

**No Changes Scenario**:
- Same workflow pattern
- Plan shows no resource changes
- Apply still executes (even with no changes)
- More workspaces processed (3+ workspaces)

### AZ_POLICY_ERROR

**Additional Features**:
- Module registry lookups for dependencies
- Apply phase reaches `"errored"` status
- Policy evaluation occurs but apply fails on Azure-specific error

---

## Important Notes

1. **Multiple Workspaces**: The CLI may process multiple workspaces in parallel, leading to interleaved API calls

2. **Repeated Patterns**: Initialization sequences repeat for each major operation phase

3. **Error Handling**: The API uses HTTP status codes appropriately:
   - `200` - Success with body
   - `201` - Created
   - `202` - Accepted (async operation started)
   - `204` - No Content (success, no body)
   - `302` - Redirect (for state downloads)
   - `307` - Temporary Redirect (for plan outputs)

4. **Authentication**: Bearer token authentication (visible in HAR files but not shown in payloads)

5. **Rate Limiting**: Consider implementing rate limiting as the CLI makes many polling requests

---

## Next Steps

For detailed request/response payload examples, see [API_PAYLOAD_EXAMPLES.md](API_PAYLOAD_EXAMPLES.md)

For raw scenario analysis, see [detailed_summary.txt](detailed_summary.txt)
