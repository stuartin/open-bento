# Terraform Cloud API Endpoints - Source Code Mapping

This document maps each Terraform Cloud API endpoint to its implementation in the Terraform CLI source code.

> **Note**: The Terraform CLI uses the [go-tfe](https://github.com/hashicorp/go-tfe) library to communicate with Terraform Cloud. The actual HTTP requests are made by the go-tfe client, while the Terraform CLI code calls the client methods.

---

## Discovery & Authentication

### GET /.well-known/terraform.json
- **Source**: Handled by [go-tfe client library](https://github.com/hashicorp/go-tfe)
- **Purpose**: Service discovery endpoint
- **Notes**: Called automatically during client initialization in go-tfe, not directly from Terraform CLI code

### GET /api/v2/ping
- **Source**: Handled by [go-tfe client library](https://github.com/hashicorp/go-tfe)
- **Purpose**: Health check endpoint
- **Notes**: Called automatically during client initialization in go-tfe, not directly from Terraform CLI code

---

## Organization Operations

### GET /api/v2/organizations/{org}/entitlement-set
- **go-tfe Method**: `Organizations.ReadEntitlements()`
- **Terraform Source**: [`backend.go` - Configure()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
- **Purpose**: Verify organization exists and read entitlements
- **Function Context**: Called during backend configuration to validate organization access

### GET /api/v2/organizations/{org}/run-queue
- **go-tfe Method**: `Organizations.ReadRunQueue()`
- **Terraform Source**: [`backend_common.go` - waitForRun()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L145)
- **Purpose**: Check organization run queue position
- **Function Context**: Called while waiting for runs to provide queue visibility

### GET /api/v2/organizations/{org}/capacity
- **go-tfe Method**: `Organizations.ReadCapacity()`
- **Terraform Source**: [`backend_common.go` - waitForRun()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L165)
- **Purpose**: Retrieve organization capacity metrics
- **Function Context**: Called while waiting to show concurrency information

---

## Workspace Operations

### GET /api/v2/organizations/{org}/workspaces/{workspace}
- **go-tfe Method**: `Workspaces.Read()`
- **Terraform Source**: Multiple locations:
  - [`backend.go` - StateMgr()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
  - [`backend.go` - DeleteWorkspace()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
  - [`backend_context.go` - getRemoteWorkspace()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_context.go)
  - [`backend_common.go` - waitForRun()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L105)
- **Purpose**: Retrieve workspace details, lock status, and configuration
- **Function Context**: Called throughout workflow for workspace information

### GET /api/v2/workspaces/{id}/current-state-version
- **go-tfe Method**: `StateVersions.ReadCurrent()`
- **Terraform Source**: [`state.go` - getStatePayload()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go)
- **Purpose**: Retrieve current state version metadata
- **Function Context**: Called when reading state to get the latest version

### POST /api/v2/workspaces (create)
- **go-tfe Method**: `Workspaces.Create()`
- **Terraform Source**: [`backend.go` - StateMgr()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
- **Purpose**: Create a new workspace
- **Function Context**: Called when workspace doesn't exist

### PATCH /api/v2/workspaces/{id} (update)
- **go-tfe Method**: `Workspaces.UpdateByID()`
- **Terraform Source**: [`backend.go` - StateMgr()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
- **Purpose**: Update workspace settings (e.g., Terraform version)
- **Function Context**: Called to sync workspace configuration

### GET /api/v2/organizations/{org}/workspaces (list)
- **go-tfe Method**: `Workspaces.List()`
- **Terraform Source**: [`backend.go` - Workspaces()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
- **Purpose**: Retrieve filtered list of workspaces by tags or name
- **Function Context**: Called when listing available workspaces

### POST /api/v2/workspaces/{id}/actions/lock
- **go-tfe Method**: `Workspaces.Lock()`
- **Terraform Source**: [`state.go` - Lock()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go)
- **Purpose**: Acquire workspace lock
- **Function Context**: Called before state modifications

### POST /api/v2/workspaces/{id}/actions/unlock
- **go-tfe Method**: `Workspaces.Unlock()` or `Workspaces.ForceUnlock()`
- **Terraform Source**: [`state.go` - Unlock()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go)
- **Purpose**: Release workspace lock
- **Function Context**: Called after state modifications or to force release

### DELETE /api/v2/workspaces/{id}
- **go-tfe Method**: `Workspaces.Delete()` or `Workspaces.SafeDelete()`
- **Terraform Source**: [`state.go` - Delete()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go)
- **Purpose**: Delete workspace
- **Function Context**: Called during workspace removal

### POST /api/v2/workspaces/{id}/tags
- **go-tfe Method**: `Workspaces.AddTags()`
- **Terraform Source**: [`backend.go` - StateMgr()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
- **Purpose**: Add legacy tags to workspace
- **Function Context**: Called during workspace configuration

### POST /api/v2/workspaces/{id}/tag-bindings
- **go-tfe Method**: `Workspaces.AddTagBindings()`
- **Terraform Source**: [`backend.go` - StateMgr()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
- **Purpose**: Add key-value tag bindings
- **Function Context**: Called during workspace configuration

### GET /api/v2/workspaces/{id}/tag-bindings
- **go-tfe Method**: `Workspaces.ListTagBindings()`
- **Terraform Source**: [`backend.go` - StateMgr()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
- **Purpose**: Retrieve existing tag bindings
- **Function Context**: Called to check current tags

---

## Project Operations

### GET /api/v2/organizations/{org}/projects
- **go-tfe Method**: `Projects.List()`
- **Terraform Source**: [`backend.go` - StateMgr() and Workspaces()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
- **Purpose**: Retrieve projects by name
- **Function Context**: Called to find or verify project configuration

### POST /api/v2/organizations/{org}/projects
- **go-tfe Method**: `Projects.Create()`
- **Terraform Source**: [`backend.go` - StateMgr()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
- **Purpose**: Create a new project
- **Function Context**: Called when configured project doesn't exist

---

## Configuration Version Operations

### POST /api/v2/workspaces/{id}/configuration-versions
- **go-tfe Method**: `ConfigurationVersions.Create()`
- **Terraform Source**: [`backend_common.go` - uploadConfigurationVersion()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L800)
- **Purpose**: Create a new configuration version with upload URL
- **Function Context**: Called before uploading Terraform configuration
- **Request Attributes**:
  - `auto-queue-runs`: false
  - `provisional`: false
  - `speculative`: true (for plan) / false (for apply)

### PUT {upload-url} (configuration upload)
- **go-tfe Method**: `ConfigurationVersions.Upload()`
- **Terraform Source**: [`backend_common.go` - uploadConfigurationVersion()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L850)
- **Purpose**: Upload tarball of Terraform configuration
- **Function Context**: Called immediately after creating configuration version

### GET /api/v2/configuration-versions/{id}
- **go-tfe Method**: `ConfigurationVersions.Read()`
- **Terraform Source**: [`backend_common.go` - uploadConfigurationVersion()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L865)
- **Purpose**: Poll for configuration upload completion status
- **Function Context**: Called in a loop until status changes to "uploaded"

---

## Run Operations

### POST /api/v2/runs
- **go-tfe Method**: `Runs.Create()`
- **Terraform Source**: [`backend_plan.go` - plan()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_plan.go#L190)
- **Purpose**: Create a new run (plan or apply)
- **Function Context**: Called after configuration upload
- **Request Attributes**:
  - `auto-apply`: false
  - `refresh`: true
  - `save-plan`: false (or true for saved plans)
- **Request Relationships**:
  - Links to configuration-version ID

### GET /api/v2/runs/{id}
- **go-tfe Method**: `Runs.Read()`
- **Terraform Source**: Multiple locations:
  - [`backend_plan.go` - plan()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_plan.go#L216)
  - [`backend_apply.go` - opApply()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_apply.go#L99)
  - [`backend_common.go` - waitForRun()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L70)
  - [`backend_common.go` - confirm()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L690)
- **Purpose**: Retrieve current run status and details
- **Function Context**: Called repeatedly to poll run status during execution

### GET /api/v2/runs/{id} (with includes)
- **go-tfe Method**: `Runs.ReadWithOptions()`
- **Terraform Source**: Multiple locations:
  - [`backend_plan.go` - renderPlanLogs()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_plan.go#L425)
  - [`backend_apply.go` - opApply()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_apply.go#L75)
  - [`backend_taskStages.go` - runTaskStages()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_taskStages.go)
- **Purpose**: Retrieve run with included relationships (workspace, plan, task stages)
- **Function Context**: Called when detailed run information is needed
- **Include Options**: workspace, plan, task-stages, etc.

### GET /api/v2/runs/{id}/run-events
- **go-tfe Method**: Appears to be custom or deprecated
- **Terraform Source**: Not found in current codebase
- **Purpose**: Get run events/logs
- **Notes**: May be called directly via HTTP or deprecated in favor of streaming logs

### POST /api/v2/runs/{id}/actions/apply
- **go-tfe Method**: `Runs.Apply()`
- **Terraform Source**: [`backend_apply.go` - opApply()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_apply.go#L154)
- **Purpose**: Trigger the apply phase of a run
- **Function Context**: Called after plan approval and policy checks pass
- **Response**: 202 Accepted

### POST /api/v2/runs/{id}/actions/cancel
- **go-tfe Method**: `Runs.Cancel()`
- **Terraform Source**: [`backend.go` - cancel()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go)
- **Purpose**: Cancel a running operation
- **Function Context**: Called when user interrupts operation

### POST /api/v2/runs/{id}/actions/discard
- **go-tfe Method**: `Runs.Discard()`
- **Terraform Source**: [`backend_common.go` - confirm()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L730)
- **Purpose**: Discard a run when user denies confirmation
- **Function Context**: Called when user input doesn't match expected keyword

### GET /api/v2/workspaces/{id}/runs (list)
- **go-tfe Method**: `Runs.List()`
- **Terraform Source**: [`backend_common.go` - waitForRun()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L120)
- **Purpose**: List runs to determine workspace queue position
- **Function Context**: Called during run waiting to show queue information

---

## Plan Operations

### GET /api/v2/plans/{id}
- **go-tfe Method**: `Plans.Read()`
- **Terraform Source**: Implicitly called through run status polling
- **Purpose**: Retrieve plan status and details
- **Function Context**: Status polled as part of run workflow
- **Status Progression**: agent_queued → running → finished

### GET /api/v2/plans/{id}/logs
- **go-tfe Method**: `Plans.Logs()`
- **Terraform Source**: [`backend_plan.go` - renderPlanLogs()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_plan.go#L385)
- **Purpose**: Stream plan execution logs in JSON format
- **Function Context**: Called to display plan output to user
- **Response**: Returns io.Reader with JSON-formatted log stream

### GET /api/v2/plans/{id}/json-output-redacted
- **go-tfe Method**: Custom API call (not standard go-tfe method)
- **Terraform Source**: [`backend_common.go` - readRedactedPlan()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L950)
- **Purpose**: Fetch redacted plan output as JSON
- **Function Context**: Called to get structured plan data
- **Response**: 307 Redirect to plan JSON file

---

## Apply Operations

### GET /api/v2/applies/{id}
- **go-tfe Method**: `Applies.Read()`
- **Terraform Source**: Implicitly called through run status polling
- **Purpose**: Retrieve apply status and details
- **Function Context**: Status polled during apply phase
- **Status Progression**: agent_queued → finished/errored

### GET /api/v2/applies/{id}/logs
- **go-tfe Method**: `Applies.Logs()`
- **Terraform Source**: [`backend_apply.go` - renderApplyLogs()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_apply.go#L180)
- **Purpose**: Stream apply execution logs in JSON format
- **Function Context**: Called to display apply output to user
- **Response**: Returns io.Reader with JSON-formatted log stream

---

## Task Stage (Policy Evaluation) Operations

### GET /api/v2/task-stages/{id}
- **go-tfe Method**: `TaskStages.Read()`
- **Terraform Source**: Multiple locations:
  - [`backend_taskStages.go` - getTaskStageWithAllOptions()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_taskStages.go)
  - [`backend_taskStages.go` - runTaskStage()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_taskStages.go)
- **Purpose**: Retrieve task stage details with results and policy evaluations
- **Function Context**: Called repeatedly to poll task stage status
- **Status Progression**: running → passed/failed
- **Include Options**: task-results, policy-evaluations.task-results

### POST /api/v2/task-stages/{id}/actions/override
- **go-tfe Method**: `TaskStages.Override()`
- **Terraform Source**: [`backend_taskStages.go` - processStageOverrides()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_taskStages.go)
- **Purpose**: Submit override request for failed policy checks
- **Function Context**: Called when user confirms override of soft-failed policies

### GET /api/v2/policy-evaluations/{id}/policy-set-outcomes
- **go-tfe Method**: Included via `TaskStages.Read()` with includes
- **Terraform Source**: [`backend_taskStages.go`](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_taskStages.go)
- **Purpose**: Get detailed policy evaluation results
- **Function Context**: Retrieved as part of task stage polling
- **Notes**: Accessed via included relationships, not a separate API call

---

## Policy Check Operations (Legacy)

### GET /api/v2/policy-checks/{id}
- **go-tfe Method**: `PolicyChecks.Read()`
- **Terraform Source**: [`backend_common.go` - checkPolicy()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L325)
- **Purpose**: Retrieve policy check status (legacy sentinel policies)
- **Function Context**: Called for older policy evaluation system
- **Notes**: Superseded by task-stages for newer Terraform versions

### GET /api/v2/policy-checks/{id}/logs
- **go-tfe Method**: `PolicyChecks.Logs()`
- **Terraform Source**: [`backend_common.go` - checkPolicy()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L315)
- **Purpose**: Read policy check logs (legacy)
- **Function Context**: Called to display policy results
- **Notes**: Legacy endpoint for sentinel policy logs

### POST /api/v2/policy-checks/{id}/actions/override
- **go-tfe Method**: `PolicyChecks.Override()`
- **Terraform Source**: [`backend_common.go` - checkPolicy()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L385)
- **Purpose**: Override soft-failed policy checks (legacy)
- **Function Context**: Called when user confirms override
- **Notes**: Legacy override mechanism

---

## Cost Estimate Operations

### GET /api/v2/cost-estimates/{id}
- **go-tfe Method**: `CostEstimates.Read()`
- **Terraform Source**: [`backend_common.go` - costEstimate()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L240)
- **Purpose**: Retrieve cost estimate status and results
- **Function Context**: Called after planning to show cost estimates
- **Notes**: Only available for supported cloud providers

---

## State Version Operations

### GET /api/v2/state-versions/{id}/current
- **go-tfe Method**: `StateVersions.ReadCurrent()`
- **Terraform Source**: [`state.go` - getStatePayload()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go)
- **Purpose**: Retrieve current state version for a workspace
- **Function Context**: Called when reading current state

### GET /api/state-versions/{id}/hosted_state
- **go-tfe Method**: `StateVersions.Download()`
- **Terraform Source**: [`state.go` - getStatePayload()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go)
- **Purpose**: Download state file content
- **Function Context**: Called after getting state version metadata
- **Response**: 302 Redirect to external storage (S3, etc.)

### POST /api/v2/state-versions
- **go-tfe Method**: `StateVersions.Upload()` or `StateVersions.Create()`
- **Terraform Source**:
  - [`state.go` - uploadState()`](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go) - Primary method
  - [`state.go` - uploadStateFallback()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go) - Fallback for older versions
- **Purpose**: Upload new state version
- **Function Context**: Called when persisting state changes
- **Notes**: Newer versions use Upload(), older versions use Create()

---

## State Version Output Operations

### GET /api/v2/state-version-outputs/current
- **go-tfe Method**: `StateVersionOutputs.ReadCurrent()`
- **Terraform Source**: [`state.go` - GetRootOutputValues()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go)
- **Purpose**: Fetch current output values from state
- **Function Context**: Called to retrieve non-sensitive outputs

### GET /api/v2/state-version-outputs/{id}
- **go-tfe Method**: `StateVersionOutputs.Read()`
- **Terraform Source**: [`state.go` - GetRootOutputValues()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go)
- **Purpose**: Retrieve specific output values (including sensitive)
- **Function Context**: Called to get sensitive output values

---

## Variable Operations

### GET /api/v2/workspaces/{id}/vars
- **go-tfe Method**: `Variables.ListAll()`
- **Terraform Source**: [`backend_context.go` - FetchVariables()](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_context.go)
- **Purpose**: Fetch all variables for a workspace
- **Function Context**: Called to retrieve Terraform variables before local operations

---

## Module Registry Operations (Optional)

### GET /api/registry/v1/modules/{org}/{name}/{provider}/versions
- **go-tfe Method**: Handled by separate registry client
- **Terraform Source**: Not in cloud backend (handled by module installer)
- **Purpose**: List available versions of a module
- **Function Context**: Called during `terraform init` when modules are referenced
- **Notes**: Registry operations are separate from cloud backend

### GET /api/registry/v1/modules/{org}/{name}/{provider}/{version}/download
- **go-tfe Method**: Handled by separate registry client
- **Terraform Source**: Not in cloud backend (handled by module installer)
- **Purpose**: Get download URL for specific module version
- **Function Context**: Called during module download
- **Response**: Redirect to module source

---

## Summary of Source Files

| File | Primary Responsibilities |
|------|-------------------------|
| [backend.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go) | Backend configuration, workspace management, organization operations, project management |
| [backend_plan.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_plan.go) | Plan operations, run creation, log streaming |
| [backend_apply.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_apply.go) | Apply operations, apply triggering, apply log streaming |
| [backend_common.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go) | Configuration upload, run waiting/polling, confirmations, policy checks, cost estimates |
| [backend_context.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_context.go) | Execution context, workspace fetching, variable retrieval |
| [backend_taskStages.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_taskStages.go) | Task stage polling, policy evaluation (modern), overrides |
| [state.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go) | State version operations, locking, output values |

---

## go-tfe Client Library

The actual HTTP API calls are implemented in the [go-tfe](https://github.com/hashicorp/go-tfe) library, which the Terraform CLI uses as a client. The go-tfe library:

1. **Handles service discovery** via `/.well-known/terraform.json`
2. **Manages authentication** with bearer tokens
3. **Implements JSON:API** request/response formatting
4. **Provides retry logic** for transient failures
5. **Manages pagination** for list operations
6. **Handles redirects** for state and log downloads

### Key go-tfe Resources

- **GitHub**: https://github.com/hashicorp/go-tfe
- **Documentation**: https://pkg.go.dev/github.com/hashicorp/go-tfe

---

## Workflow Implementation Reference

For implementing a Terraform Cloud-compatible API, you should:

1. **Study go-tfe source code** to understand exact request/response formats
2. **Follow JSON:API specification** for all endpoints
3. **Implement async state machines** matching the documented status flows
4. **Support polling patterns** with appropriate status transitions
5. **Handle includes/relationships** for nested resource loading
6. **Implement proper redirects** for large payloads (state, logs)

---

## Related Documentation

- [TERRAFORM_CLOUD_API_FLOW.md](TERRAFORM_CLOUD_API_FLOW.md) - Comprehensive API workflow documentation
- [API_WORKFLOW_DIAGRAMS.md](API_WORKFLOW_DIAGRAMS.md) - Visual Mermaid diagrams of workflows
- [detailed_summary.txt](detailed_summary.txt) - Raw analysis of captured HTTP traffic
