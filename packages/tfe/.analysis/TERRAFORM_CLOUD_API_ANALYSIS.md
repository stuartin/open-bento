# Terraform Cloud API Flow Analysis

## Executive Summary

This document provides a comprehensive analysis of the Terraform Cloud API flow based on HTTP Archive (HAR) captures from four different workflow scenarios. The analysis reveals the complete API interaction patterns between Terraform CLI and Terraform Cloud during the init-plan-apply lifecycle.

## Scenarios Analyzed

1. **SUCCESS** - Complete successful workflow (58 API calls)
2. **POLICY_FAILURE** - Policy check failure scenario (158 API calls)
3. **NO_CHANGES** - No infrastructure changes scenario (162 API calls)
4. **AZ_POLICY_ERROR** - Azure policy error scenario (177 API calls)

---

## API Flow Architecture

### Authentication & Headers

All API requests use:
- **Authorization**: `Bearer <token>` header for authentication
- **Content-Type**: `application/vnd.api+json` for POST/PATCH requests
- **User-Agent**:
  - `HashiCorp Terraform/1.13.0` for Terraform CLI calls
  - `go-tfe` for TFE Go client library calls

### Base URLs & Discovery

- **Primary API Base**: `https://app.terraform.io/api/v2/`
- **Discovery Endpoint**: `https://app.terraform.io/.well-known/terraform.json`

Discovery response provides service endpoints:
```json
{
  "modules.v1": "/api/registry/v1/modules/",
  "providers.v1": "/api/registry/v1/providers/",
  "components.v3": "/api/registry/v3/components/",
  "motd.v1": "/api/terraform/motd",
  "state.v2": "/api/v2/",
  "stacksplugin.v1": "/stacksplugin.v1",
  "tfe.v2": "/api/v2/",
  "tfe.v2.1": "/api/v2/",
  "tfe.v2.2": "/api/v2/",
  "versions.v1": "https://checkpoint-api.hashicorp.com/v1/versions/"
}
```

---

## Complete API Workflow: Successful Execution

### Phase 1: Initialization (terraform init)

#### 1.1 Service Discovery
```
GET /.well-known/terraform.json -> HTTP 200
```

#### 1.2 Connectivity Check
```
GET /api/v2/ping -> HTTP 204
```

#### 1.3 Organization & Workspace Setup
```
GET /api/v2/organizations/{org}/entitlement-set -> HTTP 200
GET /api/v2/organizations/{org}/workspaces/{workspace} -> HTTP 200
GET /api/v2/organizations/{org}/projects -> HTTP 200
```

**Response Structure** (Workspace):
```json
{
  "data": {
    "id": "ws-qLbxbNfoJGAt2N9m",
    "type": "workspaces",
    "attributes": {
      "auto-apply": false,
      "name": "platform-stuart-cc-dv",
      "locked": false,
      "environment": "default"
    }
  }
}
```

#### 1.4 State Version Retrieval
```
GET /api/v2/workspaces/{workspace_id}/current-state-version -> HTTP 200
GET /api/state-versions/{state_version_id}/hosted_state -> HTTP 302
```

**Response** (State Version):
```json
{
  "data": {
    "id": "sv-QVrcNYS748PXjQND",
    "type": "state-versions",
    "attributes": {
      "status": "finalized",
      "hosted-state-download-url": "https://app.terraform.io/api/state-versions/sv-.../hosted_state",
      "hosted-json-state-download-url": "https://app.terraform.io/api/state-versions/sv-.../hosted_json_state"
    }
  }
}
```

---

### Phase 2: Configuration Upload & Plan (terraform plan)

#### 2.1 Create Configuration Version
```
POST /api/v2/workspaces/{workspace_id}/configuration-versions -> HTTP 201
```

**Request Payload** (Speculative Plan):
```json
{
  "data": {
    "type": "configuration-versions",
    "attributes": {
      "auto-queue-runs": false,
      "provisional": false,
      "speculative": true
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "id": "cv-zNoAfsazN5oQVY22",
    "type": "configuration-versions",
    "attributes": {
      "status": "pending",
      "speculative": true,
      "upload-url": "https://archivist.terraform.io/v1/object/..."
    }
  }
}
```

#### 2.2 Poll Configuration Status
```
GET /api/v2/configuration-versions/{cv_id} -> HTTP 200
```

Status transitions: `pending` -> `uploaded`

#### 2.3 Create Run
```
POST /api/v2/runs -> HTTP 201
```

**Request Payload**:
```json
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
          "id": "cv-zNoAfsazN5oQVY22"
        }
      },
      "workspace": {
        "data": {
          "type": "workspaces",
          "id": "ws-qLbxbNfoJGAt2N9m"
        }
      }
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "id": "run-UitpJNN2bPkdtGed",
    "type": "runs",
    "attributes": {
      "status": "pending",
      "auto-apply": false
    }
  }
}
```

#### 2.4 Monitor Run Progress (Polling Pattern)

**Get Run Events**:
```
GET /api/v2/runs/{run_id}/run-events -> HTTP 200
```

**Poll Run Status** (repeated):
```
GET /api/v2/runs/{run_id} -> HTTP 200
```

Status progression:
- `pending`
- `plan_queued`
- `planning`
- `post_plan_running`
- `post_plan_completed` (for actual runs)
- `planned_and_finished` (for speculative runs)

#### 2.5 Monitor Plan Execution
```
GET /api/v2/plans/{plan_id} -> HTTP 200
```

Plan status transitions: `agent_queued` -> `running` -> `finished`

**Response**:
```json
{
  "data": {
    "id": "plan-6oewwftJfffibjxZ",
    "type": "plans",
    "attributes": {
      "status": "finished",
      "has-changes": true,
      "resource-additions": 1,
      "resource-changes": 0,
      "resource-destructions": 0
    }
  }
}
```

#### 2.6 Retrieve Plan Output
```
GET /api/v2/plans/{plan_id}/json-output-redacted -> HTTP 307 (redirect)
```

---

### Phase 3: Post-Plan Tasks & Policy Evaluation

#### 3.1 Monitor Task Stages
```
GET /api/v2/task-stages/{task_stage_id} -> HTTP 200
```

Task stage status: `running` -> `passed`

**Response**:
```json
{
  "data": {
    "id": "ts-YfQV1MS3rPEE14C6",
    "type": "task-stages",
    "attributes": {
      "status": "passed",
      "stage": "post_plan"
    }
  }
}
```

#### 3.2 Policy Evaluation
```
GET /api/v2/policy-evaluations/{poleval_id}/policy-set-outcomes -> HTTP 200
```

---

### Phase 4: Apply Preparation (terraform apply - actual run)

The pattern repeats with a **non-speculative** configuration version:

```
POST /api/v2/workspaces/{workspace_id}/configuration-versions -> HTTP 201
```

**Request Payload** (Non-Speculative):
```json
{
  "data": {
    "type": "configuration-versions",
    "attributes": {
      "auto-queue-runs": false,
      "provisional": false,
      "speculative": false
    }
  }
}
```

Then follows the same pattern:
1. Create run (POST /api/v2/runs)
2. Monitor run status
3. Monitor plan execution
4. Task stages
5. Policy evaluation

Run reaches status: `post_plan_completed`

---

### Phase 5: Apply Execution

#### 5.1 Trigger Apply
```
POST /api/v2/runs/{run_id}/actions/apply -> HTTP 202
```

**Request**: Empty JSON body or no body

**Response**: HTTP 202 Accepted

#### 5.2 Monitor Apply Progress

**Poll Run Status**:
```
GET /api/v2/runs/{run_id} -> HTTP 200
```

Status progression: `apply_queued` -> `applying` -> `applied`

**Monitor Apply Resource**:
```
GET /api/v2/applies/{apply_id} -> HTTP 200
```

Apply status: `agent_queued` -> `running` -> `finished`

**Response**:
```json
{
  "data": {
    "id": "apply-tPKXFhYiG4AKu4M6",
    "type": "applies",
    "attributes": {
      "status": "finished",
      "resource-additions": 1,
      "resource-changes": 0,
      "resource-destructions": 0
    }
  }
}
```

#### 5.3 Final Status Check
```
GET /api/v2/runs/{run_id} -> HTTP 200
```

Final run status: `applied`

---

## Key Request/Response Patterns

### 1. Configuration Version Creation

**Speculative (terraform plan)**:
```json
{
  "data": {
    "type": "configuration-versions",
    "attributes": {
      "auto-queue-runs": false,
      "provisional": false,
      "speculative": true
    }
  }
}
```

**Non-Speculative (terraform apply)**:
```json
{
  "data": {
    "type": "configuration-versions",
    "attributes": {
      "auto-queue-runs": false,
      "provisional": false,
      "speculative": false
    }
  }
}
```

### 2. Run Creation

```json
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
          "id": "cv-..."
        }
      },
      "workspace": {
        "data": {
          "type": "workspaces",
          "id": "ws-..."
        }
      }
    }
  }
}
```

### 3. Apply Trigger

```
POST /api/v2/runs/{run_id}/actions/apply
Content-Type: application/vnd.api+json
```

Response: HTTP 202 Accepted

---

## Polling Patterns

### Run Status Polling

The client polls the run status repeatedly until completion:

```
GET /api/v2/runs/{run_id} -> HTTP 200
```

**Typical polling sequence**:
1. Multiple GET requests to `/api/v2/runs/{run_id}`
2. Frequency: Every 1-3 seconds
3. Continues until terminal status reached

**Run Status States**:
- `pending`
- `plan_queued`
- `planning`
- `planned`
- `post_plan_running`
- `post_plan_completed`
- `confirmed`
- `apply_queued`
- `applying`
- `applied`
- `planned_and_finished` (speculative)

### Plan Status Polling

```
GET /api/v2/plans/{plan_id} -> HTTP 200
```

**Plan Status States**:
- `agent_queued`
- `queued`
- `running`
- `finished`
- `errored`

### Apply Status Polling

```
GET /api/v2/applies/{apply_id} -> HTTP 200
```

**Apply Status States**:
- `agent_queued`
- `queued`
- `running`
- `finished`
- `errored`

### Task Stage Polling

```
GET /api/v2/task-stages/{task_stage_id} -> HTTP 200
```

**Task Stage States**:
- `pending`
- `running`
- `passed`
- `failed`

---

## Scenario Comparisons

### API Call Volume

| Scenario | Total Calls | Init | Config Upload | Run Creation | Planning | Policy | Apply |
|----------|-------------|------|---------------|--------------|----------|--------|-------|
| SUCCESS | 58 | 13 | 4 | 2 | 27 | 6 | 4 |
| POLICY_FAILURE | 158 | 39 | 12 | 6 | 73 | 18 | 4 |
| NO_CHANGES | 162 | 41 | 12 | 6 | 77 | 18 | 4 |
| AZ_POLICY_ERROR | 177 | 45 | 14 | 8 | 82 | 20 | 6 |

### Key Differences

#### Success Scenario
- **Workspaces**: Single workspace (`platform-stuart-cc-dv`)
- **Runs**: 2 runs (1 speculative plan + 1 actual apply)
- **Final Status**: `applied`
- **Flow**: Clean execution through all phases

#### Policy Failure Scenario
- **Workspaces**: Multiple workspaces (includes `platform-f5worksafebccomlb-cc-pr`)
- **Runs**: 6 runs created
- **Additional Activity**: More extensive policy evaluations
- **Difference**: Multiple workspace operations, suggesting policy checks across dependencies

#### No Changes Scenario
- **Workspaces**: 3 workspaces (includes `platform-azurenetwork-ce-dv`)
- **Runs**: 6 runs created
- **Behavior**: Full plan/apply cycle even with no changes
- **Final Status**: `applied` (no changes applied)

#### Azure Policy Error Scenario
- **Workspaces**: 3 workspaces
- **Runs**: 8 runs created
- **Additional Calls**:
  - Module registry calls (`/api/registry/v1/modules/wcbbc/resource_group/azurerm/`)
  - Multiple apply operations (2 apply actions)
- **Difference**: Registry module resolution and additional apply attempt

---

## API Response Formats

### JSON:API Specification

All responses follow the JSON:API specification:

```json
{
  "data": {
    "id": "resource-id",
    "type": "resource-type",
    "attributes": { },
    "relationships": { },
    "links": { }
  },
  "included": [],
  "links": { }
}
```

### Common Response Headers

- `Content-Type: application/vnd.api+json; charset=utf-8`
- `X-RateLimit-Limit: 30`
- `X-RateLimit-Remaining: 29`

### Redirect Patterns

Some endpoints return HTTP 307 (Temporary Redirect):
- `/api/v2/plans/{plan_id}/json-output-redacted`
- State download URLs

These redirect to temporary signed URLs for actual content retrieval.

---

## Error Handling Patterns

### HTTP Status Codes Observed

- **200 OK**: Successful GET requests
- **201 Created**: Successful POST requests (runs, configuration versions)
- **202 Accepted**: Apply action accepted
- **204 No Content**: Ping endpoint
- **302 Found**: State download redirects
- **307 Temporary Redirect**: Plan output redirects

### Resource Status Indicators

Instead of HTTP errors, failures are indicated through resource status attributes:

**Run Status**:
- `errored`: Run encountered error
- `policy_soft_failed`: Soft policy failure
- `policy_override`: Policy override required
- `discarded`: Run was discarded

**Plan Status**:
- `errored`: Plan execution failed

**Apply Status**:
- `errored`: Apply execution failed

---

## Workflow State Machine

```
[Configuration Version Created]
          |
          v
    [Run Created] -> status: pending
          |
          v
    [Plan Queued] -> status: plan_queued
          |
          v
    [Planning] -> status: planning
          |
          v
    [Post-Plan Tasks] -> status: post_plan_running
          |
          v
    [Policy Evaluation]
          |
          v
    [Plan Complete] -> status: post_plan_completed
          |
          v
    [Apply Triggered] (manual or auto-apply)
          |
          v
    [Apply Queued] -> status: apply_queued
          |
          v
    [Applying] -> status: applying
          |
          v
    [Applied] -> status: applied
```

---

## Key Observations

### 1. Speculative vs Non-Speculative Runs

**Speculative Run** (`terraform plan`):
- Read-only operation
- `speculative: true` in configuration version
- Ends at `planned_and_finished` status
- No apply phase

**Non-Speculative Run** (`terraform apply`):
- Can modify infrastructure
- `speculative: false` in configuration version
- Progresses through apply phase
- Ends at `applied` status

### 2. Two-Phase Upload Pattern

1. **Create Configuration Version**: Receive upload URL
2. **Upload Configuration**: Send tarball to upload URL (not captured in HAR)
3. **Poll Status**: Wait for `uploaded` status

### 3. Extensive Polling

Client performs aggressive polling:
- Run status checked 5-10+ times during planning
- Plan status checked 2-6 times
- Apply status checked 2-4 times
- Polling continues until terminal state

### 4. Policy Evaluation Integration

Post-plan phase includes:
- Task stages execution
- Policy evaluation
- Both must pass before proceeding to apply

### 5. Multi-Workspace Operations

Complex scenarios involve multiple workspaces:
- Dependencies between workspaces
- Coordinated runs across workspaces
- Policy evaluations span multiple workspaces

### 6. Module Registry Integration

Azure policy error scenario shows module resolution:
```
GET /api/registry/v1/modules/wcbbc/resource_group/azurerm/versions
GET /api/registry/v1/modules/wcbbc/resource_group/azurerm/0.0.6/download
```

---

## API Endpoints Reference

### Core Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/.well-known/terraform.json` | Service discovery |
| GET | `/api/v2/ping` | Connectivity check |
| GET | `/api/v2/organizations/{org}/entitlement-set` | Get organization features |
| GET | `/api/v2/organizations/{org}/workspaces/{name}` | Get workspace by name |
| GET | `/api/v2/organizations/{org}/projects` | List projects |
| GET | `/api/v2/workspaces/{id}/current-state-version` | Get current state |
| GET | `/api/state-versions/{id}/hosted_state` | Download state file |
| POST | `/api/v2/workspaces/{id}/configuration-versions` | Create config version |
| GET | `/api/v2/configuration-versions/{id}` | Get config version status |
| POST | `/api/v2/runs` | Create run |
| GET | `/api/v2/runs/{id}` | Get run status |
| GET | `/api/v2/runs/{id}/run-events` | Get run events |
| GET | `/api/v2/plans/{id}` | Get plan status |
| GET | `/api/v2/plans/{id}/json-output-redacted` | Get plan output |
| GET | `/api/v2/task-stages/{id}` | Get task stage status |
| GET | `/api/v2/policy-evaluations/{id}/policy-set-outcomes` | Get policy results |
| POST | `/api/v2/runs/{id}/actions/apply` | Trigger apply |
| GET | `/api/v2/applies/{id}` | Get apply status |

### Registry Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/registry/v1/modules/{org}/{name}/{provider}/versions` | List module versions |
| GET | `/api/registry/v1/modules/{org}/{name}/{provider}/{version}/download` | Download module |

---

## Security Considerations

### Authentication

- Bearer token authentication required for all API calls
- Token passed in `Authorization` header
- Token format: `Bearer <token>`

### Rate Limiting

Headers observed:
- `X-RateLimit-Limit: 30`
- `X-RateLimit-Remaining: <count>`

Suggests rate limiting of 30 requests per time window.

### State File Access

State file access uses temporary redirect URLs:
- Initial request to `/api/state-versions/{id}/hosted_state`
- Returns HTTP 302 with signed URL
- Actual state download from signed URL

---

## Recommendations for API Integration

### 1. Implement Exponential Backoff

Given the extensive polling, implement exponential backoff:
- Start with 1-2 second intervals
- Increase interval if no state change
- Cap at 10-15 seconds maximum

### 2. Monitor Run Events

Use `/api/v2/runs/{id}/run-events` endpoint for real-time updates instead of constant polling.

### 3. Handle Redirects

Configure HTTP client to follow redirects (307, 302) for:
- Plan output downloads
- State file downloads

### 4. Implement Retry Logic

Implement retries with backoff for:
- Network errors
- HTTP 5xx errors
- Rate limit errors (HTTP 429)

### 5. Track Resource Relationships

Maintain mappings between:
- Configuration Version ID -> Run ID
- Run ID -> Plan ID
- Run ID -> Apply ID
- Run ID -> Task Stage IDs
- Run ID -> Policy Evaluation IDs

### 6. Status State Machine

Implement state machine for run statuses to:
- Track valid transitions
- Detect unexpected states
- Handle terminal states (applied, errored, discarded)

---

## Appendix: Example Complete Flow

### Minimal Successful Flow

1. Service Discovery: `GET /.well-known/terraform.json`
2. Ping: `GET /api/v2/ping`
3. Get Entitlements: `GET /api/v2/organizations/{org}/entitlement-set`
4. Get Workspace: `GET /api/v2/organizations/{org}/workspaces/{name}`
5. Get Current State: `GET /api/v2/workspaces/{ws_id}/current-state-version`
6. Download State: `GET /api/state-versions/{sv_id}/hosted_state`
7. Create Config (plan): `POST /api/v2/workspaces/{ws_id}/configuration-versions` (speculative=true)
8. Check Upload: `GET /api/v2/configuration-versions/{cv_id}`
9. Create Plan Run: `POST /api/v2/runs`
10. Poll Run: `GET /api/v2/runs/{run_id}` (until planned_and_finished)
11. Get Plan: `GET /api/v2/plans/{plan_id}`
12. Get Plan Output: `GET /api/v2/plans/{plan_id}/json-output-redacted`
13. Check Tasks: `GET /api/v2/task-stages/{ts_id}`
14. Check Policy: `GET /api/v2/policy-evaluations/{pe_id}/policy-set-outcomes`
15. Create Config (apply): `POST /api/v2/workspaces/{ws_id}/configuration-versions` (speculative=false)
16. Check Upload: `GET /api/v2/configuration-versions/{cv_id}`
17. Create Apply Run: `POST /api/v2/runs`
18. Poll Run: `GET /api/v2/runs/{run_id}` (until post_plan_completed)
19. Trigger Apply: `POST /api/v2/runs/{run_id}/actions/apply`
20. Poll Run: `GET /api/v2/runs/{run_id}` (until applied)
21. Poll Apply: `GET /api/v2/applies/{apply_id}` (until finished)

---

## Conclusion

The Terraform Cloud API follows a clear, resource-oriented design with:

1. **Predictable Patterns**: Consistent create -> poll -> complete cycles
2. **Status-Driven Flow**: State transitions guide workflow progression
3. **Polling-Based Updates**: Aggressive status polling for real-time feedback
4. **JSON:API Compliance**: Standard response formats across all endpoints
5. **Security**: Token-based auth with rate limiting
6. **Scalability**: Handles complex multi-workspace scenarios

The workflow distinctly separates:
- **Planning** (speculative runs) - read-only analysis
- **Applying** (non-speculative runs) - infrastructure modification

This analysis provides a complete understanding for implementing Terraform Cloud API integrations, automations, or custom tooling.
