# Terraform Cloud API - Minimal TypeScript Zod Schemas

This document contains TypeScript Zod schemas defining the **absolute minimum** attributes required for each entity to successfully complete the Terraform Cloud API workflow.

> **Note**: These schemas are based on analysis of the actual Terraform CLI source code to identify which fields are actually read/written during operations.

## Installation

```bash
npm install zod
```

## JSON:API Base Schemas

```typescript
import { z } from 'zod';

// JSON:API base resource schema
const jsonApiResource = <T extends z.ZodRawShape>(
  type: string,
  attributes: T
) => z.object({
  data: z.object({
    type: z.literal(type),
    id: z.string(),
    attributes: z.object(attributes),
    relationships: z.record(z.any()).optional(),
  }),
});

// JSON:API relationship reference
const relationshipRef = (type: string) => z.object({
  data: z.object({
    type: z.literal(type),
    id: z.string(),
  }),
});

// JSON:API resource list
const jsonApiList = <T extends z.ZodRawShape>(
  type: string,
  attributes: T
) => z.object({
  data: z.array(z.object({
    type: z.literal(type),
    id: z.string(),
    attributes: z.object(attributes),
    relationships: z.record(z.any()).optional(),
  })),
});
```

---

## 1. Organization

### Minimal Attributes

```typescript
// GET /api/v2/organizations/{org}/entitlement-set
const OrganizationEntitlementSetSchema = z.object({
  data: z.object({
    type: z.literal('entitlement-sets'),
    id: z.string(),
    attributes: z.object({
      // Only field actually checked in backend.go
      operations: z.boolean(), // Determines if remote operations are enabled
    }),
  }),
});

type OrganizationEntitlementSet = z.infer<typeof OrganizationEntitlementSetSchema>;
```

**Fields Used In Source**:
- `operations` - Checked in [backend.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go) to determine execution mode

---

## 2. Workspace

### Minimal Attributes

```typescript
// GET /api/v2/organizations/{org}/workspaces/{workspace}
const WorkspaceSchema = z.object({
  data: z.object({
    type: z.literal('workspaces'),
    id: z.string(),
    attributes: z.object({
      name: z.string(),
      'execution-mode': z.enum(['remote', 'local', 'agent']),
      'terraform-version': z.string().nullable(),
      locked: z.boolean().optional(),
    }),
    relationships: z.object({
      organization: z.object({
        data: z.object({
          type: z.literal('organizations'),
          id: z.string(),
        }),
      }),
      'current-state-version': z.object({
        data: z.object({
          type: z.literal('state-versions'),
          id: z.string(),
        }).nullable(),
      }).optional(),
    }).optional(),
  }),
});

type Workspace = z.infer<typeof WorkspaceSchema>;
```

**Fields Used In Source**:
- `id` - Used throughout for API calls
- `name` - Displayed to user
- `execution-mode` - Determines local vs remote execution
- `terraform-version` - May be updated to match local version
- `locked` - Checked during waitForRun in [backend_common.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go)
- `organization.name` - Used in [backend_apply.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_apply.go)

---

## 3. Configuration Version

### Request Schema (POST)

```typescript
// POST /api/v2/workspaces/{id}/configuration-versions
const ConfigurationVersionCreateRequestSchema = z.object({
  data: z.object({
    type: z.literal('configuration-versions'),
    attributes: z.object({
      'auto-queue-runs': z.boolean(), // Always false in Terraform CLI
      provisional: z.boolean(),        // Always false in Terraform CLI
      speculative: z.boolean(),        // true for plan, false for apply
    }),
  }),
});

type ConfigurationVersionCreateRequest = z.infer<typeof ConfigurationVersionCreateRequestSchema>;
```

### Response Schema (GET/POST)

```typescript
// Response from POST or GET /api/v2/configuration-versions/{id}
const ConfigurationVersionSchema = z.object({
  data: z.object({
    type: z.literal('configuration-versions'),
    id: z.string(),
    attributes: z.object({
      'auto-queue-runs': z.boolean(),
      speculative: z.boolean(),
      provisional: z.boolean(),
      status: z.enum(['pending', 'uploaded', 'errored']), // Polled until 'uploaded'
      'upload-url': z.string(), // Used to upload tarball
    }),
  }),
});

type ConfigurationVersion = z.infer<typeof ConfigurationVersionSchema>;
```

**Fields Used In Source**:
- `id` - Used to poll upload status in [backend_common.go#L865](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L865)
- `status` - Polled until equals "uploaded"
- `upload-url` - Used for PUT request with tarball
- `speculative` - Determines if run can be applied

---

## 4. Run

### Request Schema (POST)

```typescript
// POST /api/v2/runs
const RunCreateRequestSchema = z.object({
  data: z.object({
    type: z.literal('runs'),
    attributes: z.object({
      'auto-apply': z.boolean(),    // Usually false (requires manual confirmation)
      refresh: z.boolean(),          // Usually true
      'save-plan': z.boolean(),      // true when saving plan for later
      message: z.string().optional(),
      variables: z.array(z.object({
        key: z.string(),
        value: z.string(),
      })).optional(),
    }),
    relationships: z.object({
      'configuration-version': z.object({
        data: z.object({
          type: z.literal('configuration-versions'),
          id: z.string(),
        }),
      }),
      workspace: z.object({
        data: z.object({
          type: z.literal('workspaces'),
          id: z.string(),
        }),
      }).optional(), // Usually inferred from configuration-version
    }),
  }),
});

type RunCreateRequest = z.infer<typeof RunCreateRequestSchema>;
```

### Response Schema (GET)

```typescript
// Run status enum - based on actual observed statuses in source code
const RunStatusSchema = z.enum([
  'pending',
  'plan_queued',
  'planning',
  'planned',
  'cost_estimating',
  'cost_estimated',
  'policy_checking',
  'policy_override',
  'policy_soft_failed',
  'policy_checked',
  'confirmed',
  'post_plan_running',
  'post_plan_completed',
  'planned_and_finished', // Terminal state for speculative runs
  'apply_queued',
  'applying',
  'applied',              // Terminal state (success)
  'discarded',
  'errored',              // Terminal state (error)
  'canceled',
  // --- Additional go-tfe statuses (not required for minimal API flow) ---
  // 'fetching',
  // 'fetching_completed',
  // 'planned_and_saved',
  // 'post_plan_awaiting_decision',
  // 'pre_plan_running',
  // 'pre_plan_completed',
  // 'pre_apply_running',
  // 'pre_apply_completed',
  // 'post_apply_running',
  // 'post_apply_completed',
  // 'queuing',
  // 'queuing_apply',
]);

// GET /api/v2/runs/{id}
const RunSchema = z.object({
  data: z.object({
    type: z.literal('runs'),
    id: z.string(),
    attributes: z.object({
      status: RunStatusSchema,
      'has-changes': z.boolean(),        // Checked in backend_apply.go
      'is-destroy': z.boolean().optional(),
      message: z.string().nullable().optional(),
      'created-at': z.string().optional(),
      'position-in-queue': z.number().optional(),
      actions: z.object({
        'is-cancelable': z.boolean(),
        'is-confirmable': z.boolean(),
        'is-discardable': z.boolean(),
        'is-force-cancelable': z.boolean().optional(),
      }),
    }),
    relationships: z.object({
      plan: z.object({
        data: z.object({
          type: z.literal('plans'),
          id: z.string(),
        }).nullable(),
      }).optional(),
      apply: z.object({
        data: z.object({
          type: z.literal('applies'),
          id: z.string(),
        }).nullable(),
      }).optional(),
      'configuration-version': relationshipRef('configuration-versions').optional(),
      workspace: z.object({
        data: z.object({
          type: z.literal('workspaces'),
          id: z.string(),
        }),
      }).optional(),
      'cost-estimate': z.object({
        data: z.object({
          type: z.literal('cost-estimates'),
          id: z.string(),
        }).nullable(),
      }).optional(),
      'task-stages': z.object({
        data: z.array(z.object({
          type: z.literal('task-stages'),
          id: z.string(),
        })),
      }).optional(),
    }).optional(),
  }),
});

type Run = z.infer<typeof RunSchema>;
```

**Fields Used In Source**:
- `id` - Used throughout
- `status` - Heavily polled in [backend_common.go#L70](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L70)
- `has-changes` - Checked in [backend_apply.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_apply.go)
- `actions.is-confirmable` - Checked before confirmation
- `actions.is-cancelable` - Checked in [backend_plan.go#L216](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_plan.go#L216)
- `plan.id` - Used to fetch plan logs
- `apply.id` - Used to fetch apply logs
- `workspace.id`, `workspace.organization.name`, `workspace.name` - Used in [backend_apply.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_apply.go)

---

## 5. Plan

### Response Schema (GET)

```typescript
// Plan status enum
const PlanStatusSchema = z.enum([
  'pending',
  'queued',            // Defined in go-tfe as PlanQueued
  'agent_queued',      // Used when run is queued on an agent pool
  'running',
  'errored',
  'canceled',
  'finished',
  'unreachable',
  // --- Additional go-tfe statuses (not required for minimal API flow) ---
  // 'created',         // PlanCreated - initial state before queuing
  // 'mfa_waiting',     // PlanMFAWaiting - waiting for MFA confirmation
]);

// GET /api/v2/plans/{id}
const PlanSchema = z.object({
  data: z.object({
    type: z.literal('plans'),
    id: z.string(),
    attributes: z.object({
      status: PlanStatusSchema,
      'generated-configuration': z.boolean().optional(), // For import workflows
      'log-read-url': z.string().optional(),
      'has-changes': z.boolean().optional(),
      'resource-additions': z.number().optional(),
      'resource-changes': z.number().optional(),
      'resource-destructions': z.number().optional(),
    }),
  }),
});

type Plan = z.infer<typeof PlanSchema>;

// GET /api/v2/plans/{id}/json-output-redacted
// Returns 307 redirect to actual JSON file
const PlanJsonOutputSchema = z.object({
  format_version: z.string(),
  terraform_version: z.string().optional(),
  planned_values: z.record(z.any()).optional(),
  resource_changes: z.array(z.any()).optional(),
  output_changes: z.record(z.any()).optional(),
  prior_state: z.record(z.any()).optional(),
  configuration: z.record(z.any()).optional(),
});

type PlanJsonOutput = z.infer<typeof PlanJsonOutputSchema>;
```

**Fields Used In Source**:
- `id` - Used to fetch logs in [backend_plan.go#L385](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_plan.go#L385)
- `status` - Checked for "errored" and "finished" in [backend_plan.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_plan.go)
- `generated-configuration` - Boolean flag checked in plan rendering

---

## 6. Apply

### Response Schema (GET)

```typescript
// Apply status enum
const ApplyStatusSchema = z.enum([
  'pending',
  'queued',
  'agent_queued',      // Used when apply is queued on an agent pool
  'running',           // May not be observed (direct transition)
  'errored',
  'canceled',
  'finished',
  'unreachable',
  // --- Additional go-tfe statuses (not required for minimal API flow) ---
  // 'created',         // ApplyCreated - initial state before queuing
  // 'mfa_waiting',     // ApplyMFAWaiting - waiting for MFA confirmation
]);

// GET /api/v2/applies/{id}
const ApplySchema = z.object({
  data: z.object({
    type: z.literal('applies'),
    id: z.string(),
    attributes: z.object({
      status: ApplyStatusSchema,
      'log-read-url': z.string().optional(),
      'resource-additions': z.number().optional(),
      'resource-changes': z.number().optional(),
      'resource-destructions': z.number().optional(),
    }),
  }),
});

type Apply = z.infer<typeof ApplySchema>;
```

**Fields Used In Source**:
- `id` - Retrieved from run.apply.id in [backend_apply.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_apply.go)
- `status` - Polled during apply execution

---

## 7. Task Stage (Policy Evaluation)

### Response Schema (GET)

```typescript
// Task stage enum
const TaskStageStageSchema = z.enum([
  'pre_plan',
  'post_plan',
  'pre_apply',
]);

// Task stage status enum
const TaskStageStatusSchema = z.enum([
  'pending',
  'running',
  'passed',
  'failed',
  'awaiting_override',
  'overridden',
  'unreachable',
  'canceled',
  'errored',
]);

// GET /api/v2/task-stages/{id}
const TaskStageSchema = z.object({
  data: z.object({
    type: z.literal('task-stages'),
    id: z.string(),
    attributes: z.object({
      stage: TaskStageStageSchema,
      status: TaskStageStatusSchema,
      'created-at': z.string().optional(),
      'updated-at': z.string().optional(),
    }),
    relationships: z.object({
      'task-results': z.object({
        data: z.array(z.object({
          type: z.literal('task-results'),
          id: z.string(),
        })),
      }).optional(),
      'policy-evaluations': z.object({
        data: z.array(z.object({
          type: z.literal('policy-evaluations'),
          id: z.string(),
        })),
      }).optional(),
    }).optional(),
  }),
});

type TaskStage = z.infer<typeof TaskStageSchema>;
```

**Fields Used In Source**:
- `id` - Used in [backend_taskStages.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_taskStages.go)
- `stage` - Used as map key in task stage processing
- `status` - Polled until terminal state (passed/failed)

---

## 8. State Version

### Response Schema (GET)

```typescript
// GET /api/v2/workspaces/{id}/current-state-version
const StateVersionSchema = z.object({
  data: z.object({
    type: z.literal('state-versions'),
    id: z.string(),
    attributes: z.object({
      'created-at': z.string(),
      serial: z.number(),
      status: z.enum(['pending', 'finalized', 'discarded']), // State version status
      'hosted-state-download-url': z.string(), // Redirects to actual state file
    }),
    relationships: z.object({
      outputs: z.object({
        data: z.array(z.object({
          type: z.literal('state-version-outputs'),
          id: z.string(),
        })),
      }).optional(),
    }).optional(),
  }).nullable(), // Can be null if no state exists
});

type StateVersion = z.infer<typeof StateVersionSchema>;

// State version output
const StateVersionOutputSchema = z.object({
  data: z.object({
    type: z.literal('state-version-outputs'),
    id: z.string(),
    attributes: z.object({
      name: z.string(),
      sensitive: z.boolean(),
      value: z.any(),
      'detailed-type': z.string().nullable(),
    }),
  }),
});

type StateVersionOutput = z.infer<typeof StateVersionOutputSchema>;
```

**Fields Used In Source**:
- `id` - Used to download state
- `status` - Indicates state version status (finalized, pending, discarded)
- `hosted-state-download-url` - Used in [state.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/state.go) to download state
- Outputs: `name`, `sensitive`, `value`, `detailed-type` - Used for output retrieval

---

## 9. Run Actions

### Apply Action (POST)

```typescript
// POST /api/v2/runs/{id}/actions/apply
const RunApplyRequestSchema = z.object({
  comment: z.string().optional(),
});

type RunApplyRequest = z.infer<typeof RunApplyRequestSchema>;

// Response: 202 Accepted (no body typically)
```

### Discard Action (POST)

```typescript
// POST /api/v2/runs/{id}/actions/discard
const RunDiscardRequestSchema = z.object({
  comment: z.string().optional(),
});

type RunDiscardRequest = z.infer<typeof RunDiscardRequestSchema>;
```

### Cancel Action (POST)

```typescript
// POST /api/v2/runs/{id}/actions/cancel
const RunCancelRequestSchema = z.object({
  comment: z.string().optional(),
});

type RunCancelRequest = z.infer<typeof RunCancelRequestSchema>;
```

**Fields Used In Source**:
- These actions typically return 202 Accepted with minimal/no response body
- Used in [backend_apply.go#L154](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_apply.go#L154) (apply)
- Used in [backend_common.go#L730](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L730) (discard)
- Used in [backend.go](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend.go) (cancel)

---

## 10. Supporting Resources

### Organization Run Queue

```typescript
// GET /api/v2/organizations/{org}/run-queue
const OrganizationRunQueueSchema = z.object({
  data: z.array(z.object({
    type: z.literal('runs'),
    id: z.string(),
    attributes: z.object({
      status: RunStatusSchema,
      'position-in-queue': z.number().optional(),
    }),
  })),
});

type OrganizationRunQueue = z.infer<typeof OrganizationRunQueueSchema>;
```

### Cost Estimate

```typescript
const CostEstimateStatusSchema = z.enum([
  'pending',
  'queued',
  'running',
  'errored',
  'canceled',
  'finished',
]);

// GET /api/v2/cost-estimates/{id}
const CostEstimateSchema = z.object({
  data: z.object({
    type: z.literal('cost-estimates'),
    id: z.string(),
    attributes: z.object({
      status: CostEstimateStatusSchema,
      'error-message': z.string().nullable().optional(),
      'prior-monthly-cost': z.string().optional(),
      'proposed-monthly-cost': z.string().optional(),
    }),
  }),
});

type CostEstimate = z.infer<typeof CostEstimateSchema>;
```

**Fields Used In Source**:
- Used in [backend_common.go#L240](https://github.com/hashicorp/terraform/blob/main/internal/cloud/backend_common.go#L240)

---

## 11. Error Response

```typescript
// Standard JSON:API error response
const JsonApiErrorSchema = z.object({
  errors: z.array(z.object({
    status: z.string(),
    title: z.string(),
    detail: z.string().optional(),
    source: z.object({
      pointer: z.string().optional(),
      parameter: z.string().optional(),
    }).optional(),
  })),
});

type JsonApiError = z.infer<typeof JsonApiErrorSchema>;
```

---

## Complete Workflow Type Definitions

```typescript
// Export all schemas
export {
  // Organizations
  OrganizationEntitlementSetSchema,

  // Workspaces
  WorkspaceSchema,

  // Configuration Versions
  ConfigurationVersionCreateRequestSchema,
  ConfigurationVersionSchema,

  // Runs
  RunCreateRequestSchema,
  RunSchema,
  RunStatusSchema,
  RunApplyRequestSchema,
  RunDiscardRequestSchema,
  RunCancelRequestSchema,

  // Plans
  PlanSchema,
  PlanStatusSchema,
  PlanJsonOutputSchema,

  // Applies
  ApplySchema,
  ApplyStatusSchema,

  // Task Stages
  TaskStageSchema,
  TaskStageStageSchema,
  TaskStageStatusSchema,

  // State
  StateVersionSchema,
  StateVersionOutputSchema,

  // Supporting
  OrganizationRunQueueSchema,
  CostEstimateSchema,

  // Errors
  JsonApiErrorSchema,
};

// Export all types
export type {
  OrganizationEntitlementSet,
  Workspace,
  ConfigurationVersionCreateRequest,
  ConfigurationVersion,
  RunCreateRequest,
  Run,
  Plan,
  PlanJsonOutput,
  Apply,
  TaskStage,
  StateVersion,
  StateVersionOutput,
  RunApplyRequest,
  RunDiscardRequest,
  RunCancelRequest,
  OrganizationRunQueue,
  CostEstimate,
  JsonApiError,
};
```

---

## Usage Examples

### Validating API Responses

```typescript
import { RunSchema, PlanSchema } from './schemas';

// Validate a run response
const runResponse = await fetch('/api/v2/runs/run-xxx');
const runData = await runResponse.json();
const validatedRun = RunSchema.parse(runData);

console.log(validatedRun.data.attributes.status); // Type-safe!

// Validate a plan response
const planResponse = await fetch('/api/v2/plans/plan-xxx');
const planData = await planResponse.json();
const validatedPlan = PlanSchema.parse(planData);

if (validatedPlan.data.attributes.status === 'finished') {
  console.log('Plan complete!');
}
```

### Creating Requests

```typescript
import { ConfigurationVersionCreateRequestSchema, RunCreateRequestSchema } from './schemas';

// Create configuration version request
const cvRequest: z.infer<typeof ConfigurationVersionCreateRequestSchema> = {
  data: {
    type: 'configuration-versions',
    attributes: {
      'auto-queue-runs': false,
      provisional: false,
      speculative: true, // For plan operation
    },
  },
};

// Validate before sending
ConfigurationVersionCreateRequestSchema.parse(cvRequest);

// Create run request
const runRequest: z.infer<typeof RunCreateRequestSchema> = {
  data: {
    type: 'runs',
    attributes: {
      'auto-apply': false,
      refresh: true,
      'save-plan': false,
    },
    relationships: {
      'configuration-version': {
        data: {
          type: 'configuration-versions',
          id: 'cv-abc123',
        },
      },
    },
  },
};

RunCreateRequestSchema.parse(runRequest);
```

---

## Key Implementation Notes

1. **All schemas follow JSON:API specification** with `data`, `type`, `id`, `attributes`, and `relationships` structure

2. **Minimal field set**: These schemas include ONLY the fields that are:
   - Read/checked in Terraform CLI source code
   - Required for API workflow to function
   - Necessary for status polling and transitions

3. **Status enums** are based on:
   - Observed values in .har files
   - Status checks in Terraform source code
   - Documented state machine transitions

4. **Optional fields** marked with `.optional()` are:
   - Fields that may not always be present
   - Relationships that are conditionally included
   - Nullable values that can legitimately be null

5. **Source code alignment**:
   - Every included field has a corresponding usage in Terraform CLI code
   - Links to source code provided in comments
   - Based on analysis of go-tfe library and internal/cloud package

---

## Related Documentation

- [TERRAFORM_CLOUD_API_FLOW.md](TERRAFORM_CLOUD_API_FLOW.md) - Complete API workflow
- [API_ENDPOINTS_SOURCE_CODE_MAPPING.md](API_ENDPOINTS_SOURCE_CODE_MAPPING.md) - Source code references
- [API_WORKFLOW_DIAGRAMS.md](API_WORKFLOW_DIAGRAMS.md) - Visual workflow diagrams
- [JSON:API Specification](https://jsonapi.org/) - API format standard
