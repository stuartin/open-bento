# Terraform Cloud API - oRPC Contract Definitions

This document defines oRPC contracts for the Terraform Cloud API using the contract-first approach with detailed mode for OpenAPI compatibility.

> **Note**: These contracts use the entity schemas defined in [JSONAPI_SERDE_INTEGRATION.md](JSONAPI_SERDE_INTEGRATION.md) for serialization/deserialization.

## Installation

```bash
npm install @orpc/contract @orpc/server zod
```

---

## Schema Imports

```typescript
import { z } from 'zod';
import { oc } from '@orpc/contract';

// Import attribute schemas from JSONAPI_SERDE definitions
import {
  WorkspaceAttributesSchema,
  ConfigurationVersionAttributesSchema,
  RunAttributesSchema,
  PlanAttributesSchema,
  ApplyAttributesSchema,
  TaskStageAttributesSchema,
  StateVersionAttributesSchema,
  StateVersionOutputAttributesSchema,
  CostEstimateAttributesSchema,
  OrganizationAttributesSchema,
} from './schemas';
```

---

## Common Schemas

```typescript
// JSON:API document wrapper for single resource
const JsonApiDocument = <T extends z.ZodTypeAny>(
  type: string,
  attributesSchema: T
) => z.object({
  data: z.object({
    type: z.literal(type),
    id: z.string(),
    attributes: attributesSchema,
    relationships: z.record(z.any()).optional(),
  }),
});

// JSON:API document wrapper for resource collection
const JsonApiCollection = <T extends z.ZodTypeAny>(
  type: string,
  attributesSchema: T
) => z.object({
  data: z.array(z.object({
    type: z.literal(type),
    id: z.string(),
    attributes: attributesSchema,
    relationships: z.record(z.any()).optional(),
  })),
});

// JSON:API error response
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

// Common headers
const AuthHeadersSchema = z.object({
  authorization: z.string().describe('Bearer token'),
  'content-type': z.literal('application/vnd.api+json').optional(),
});
```

---

## 1. Organization Entitlements

```typescript
// --- Input Types ---
const GetOrganizationEntitlementsInput = z.object({
  params: z.object({
    organization: z.string().describe('Organization name'),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const OrganizationEntitlementsOutputSchema = z.object({
  data: z.object({
    type: z.literal('entitlement-sets'),
    id: z.string(),
    attributes: z.object({
      operations: z.boolean(),
    }),
  }),
});

// --- Contract ---
export const getOrganizationEntitlements = oc
  .route({
    path: '/api/v2/organizations/{organization}/entitlement-set',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetOrganizationEntitlementsInput)
  .output(z.object({
    status: z.literal(200),
    body: OrganizationEntitlementsOutputSchema,
  }));
```

---

## 2. Workspace

```typescript
// --- Input Types ---
const GetWorkspaceInput = z.object({
  params: z.object({
    organization: z.string().describe('Organization name'),
    workspace: z.string().describe('Workspace name'),
  }),
  headers: AuthHeadersSchema,
});

const ListWorkspacesInput = z.object({
  params: z.object({
    organization: z.string().describe('Organization name'),
  }),
  query: z.object({
    'page[number]': z.number().int().min(1).optional(),
    'page[size]': z.number().int().min(1).max(100).optional(),
    search: z.string().optional(),
  }).optional(),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const WorkspaceOutputSchema = JsonApiDocument('workspaces', WorkspaceAttributesSchema);
const WorkspacesOutputSchema = JsonApiCollection('workspaces', WorkspaceAttributesSchema);

// --- Contracts ---
export const getWorkspace = oc
  .route({
    path: '/api/v2/organizations/{organization}/workspaces/{workspace}',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetWorkspaceInput)
  .output(z.object({
    status: z.literal(200),
    body: WorkspaceOutputSchema,
  }));

export const listWorkspaces = oc
  .route({
    path: '/api/v2/organizations/{organization}/workspaces',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(ListWorkspacesInput)
  .output(z.object({
    status: z.literal(200),
    body: WorkspacesOutputSchema,
  }));
```

---

## 3. Configuration Version

```typescript
// --- Input Types ---
const CreateConfigurationVersionInput = z.object({
  params: z.object({
    workspaceId: z.string().describe('Workspace ID'),
  }),
  headers: AuthHeadersSchema,
  body: z.object({
    data: z.object({
      type: z.literal('configuration-versions'),
      attributes: z.object({
        'auto-queue-runs': z.boolean().default(false),
        provisional: z.boolean().default(false),
        speculative: z.boolean(),
      }),
    }),
  }),
});

const GetConfigurationVersionInput = z.object({
  params: z.object({
    configurationVersionId: z.string().describe('Configuration Version ID'),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const ConfigurationVersionOutputSchema = JsonApiDocument(
  'configuration-versions',
  ConfigurationVersionAttributesSchema
);

// --- Contracts ---
export const createConfigurationVersion = oc
  .route({
    path: '/api/v2/workspaces/{workspaceId}/configuration-versions',
    method: 'POST',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(CreateConfigurationVersionInput)
  .output(z.object({
    status: z.literal(201),
    body: ConfigurationVersionOutputSchema,
  }));

export const getConfigurationVersion = oc
  .route({
    path: '/api/v2/configuration-versions/{configurationVersionId}',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetConfigurationVersionInput)
  .output(z.object({
    status: z.literal(200),
    body: ConfigurationVersionOutputSchema,
  }));
```

---

## 4. Run

```typescript
// --- Input Types ---
const CreateRunInput = z.object({
  headers: AuthHeadersSchema,
  body: z.object({
    data: z.object({
      type: z.literal('runs'),
      attributes: z.object({
        'auto-apply': z.boolean().default(false),
        refresh: z.boolean().default(true),
        'save-plan': z.boolean().default(false),
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
        }).optional(),
      }),
    }),
  }),
});

const GetRunInput = z.object({
  params: z.object({
    runId: z.string().describe('Run ID'),
  }),
  headers: AuthHeadersSchema,
});

const ListRunsInput = z.object({
  params: z.object({
    workspaceId: z.string().describe('Workspace ID'),
  }),
  query: z.object({
    'page[number]': z.number().int().min(1).optional(),
    'page[size]': z.number().int().min(1).max(100).optional(),
  }).optional(),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const RunOutputSchema = JsonApiDocument('runs', RunAttributesSchema);
const RunsOutputSchema = JsonApiCollection('runs', RunAttributesSchema);

// --- Contracts ---
export const createRun = oc
  .route({
    path: '/api/v2/runs',
    method: 'POST',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(CreateRunInput)
  .output(z.object({
    status: z.literal(201),
    body: RunOutputSchema,
  }));

export const getRun = oc
  .route({
    path: '/api/v2/runs/{runId}',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetRunInput)
  .output(z.object({
    status: z.literal(200),
    body: RunOutputSchema,
  }));

export const listRuns = oc
  .route({
    path: '/api/v2/workspaces/{workspaceId}/runs',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(ListRunsInput)
  .output(z.object({
    status: z.literal(200),
    body: RunsOutputSchema,
  }));
```

---

## 5. Run Actions

```typescript
// --- Input Types ---
const RunActionInput = z.object({
  params: z.object({
    runId: z.string().describe('Run ID'),
  }),
  headers: AuthHeadersSchema,
  body: z.object({
    comment: z.string().optional(),
  }).optional(),
});

// --- Contracts ---
export const applyRun = oc
  .route({
    path: '/api/v2/runs/{runId}/actions/apply',
    method: 'POST',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(RunActionInput)
  .output(z.object({
    status: z.literal(202),
    body: z.undefined(),
  }));

export const discardRun = oc
  .route({
    path: '/api/v2/runs/{runId}/actions/discard',
    method: 'POST',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(RunActionInput)
  .output(z.object({
    status: z.literal(202),
    body: z.undefined(),
  }));

export const cancelRun = oc
  .route({
    path: '/api/v2/runs/{runId}/actions/cancel',
    method: 'POST',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(RunActionInput)
  .output(z.object({
    status: z.literal(202),
    body: z.undefined(),
  }));

export const forceCancelRun = oc
  .route({
    path: '/api/v2/runs/{runId}/actions/force-cancel',
    method: 'POST',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(RunActionInput)
  .output(z.object({
    status: z.literal(202),
    body: z.undefined(),
  }));
```

---

## 6. Plan

```typescript
// --- Input Types ---
const GetPlanInput = z.object({
  params: z.object({
    planId: z.string().describe('Plan ID'),
  }),
  headers: AuthHeadersSchema,
});

const GetPlanJsonOutputInput = z.object({
  params: z.object({
    planId: z.string().describe('Plan ID'),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const PlanOutputSchema = JsonApiDocument('plans', PlanAttributesSchema);

const PlanJsonOutputSchema = z.object({
  format_version: z.string(),
  terraform_version: z.string().optional(),
  planned_values: z.record(z.any()).optional(),
  resource_changes: z.array(z.any()).optional(),
  output_changes: z.record(z.any()).optional(),
  prior_state: z.record(z.any()).optional(),
  configuration: z.record(z.any()).optional(),
});

// --- Contracts ---
export const getPlan = oc
  .route({
    path: '/api/v2/plans/{planId}',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetPlanInput)
  .output(z.object({
    status: z.literal(200),
    body: PlanOutputSchema,
  }));

export const getPlanJsonOutput = oc
  .route({
    path: '/api/v2/plans/{planId}/json-output-redacted',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetPlanJsonOutputInput)
  .output(z.union([
    z.object({
      status: z.literal(200),
      body: PlanJsonOutputSchema,
    }),
    z.object({
      status: z.literal(307),
      headers: z.object({
        location: z.string(),
      }),
      body: z.undefined(),
    }),
  ]));
```

---

## 7. Apply

```typescript
// --- Input Types ---
const GetApplyInput = z.object({
  params: z.object({
    applyId: z.string().describe('Apply ID'),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const ApplyOutputSchema = JsonApiDocument('applies', ApplyAttributesSchema);

// --- Contract ---
export const getApply = oc
  .route({
    path: '/api/v2/applies/{applyId}',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetApplyInput)
  .output(z.object({
    status: z.literal(200),
    body: ApplyOutputSchema,
  }));
```

---

## 8. Task Stage

```typescript
// --- Input Types ---
const GetTaskStageInput = z.object({
  params: z.object({
    taskStageId: z.string().describe('Task Stage ID'),
  }),
  headers: AuthHeadersSchema,
});

const ListTaskStagesInput = z.object({
  params: z.object({
    runId: z.string().describe('Run ID'),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const TaskStageOutputSchema = JsonApiDocument('task-stages', TaskStageAttributesSchema);
const TaskStagesOutputSchema = JsonApiCollection('task-stages', TaskStageAttributesSchema);

// --- Contracts ---
export const getTaskStage = oc
  .route({
    path: '/api/v2/task-stages/{taskStageId}',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetTaskStageInput)
  .output(z.object({
    status: z.literal(200),
    body: TaskStageOutputSchema,
  }));

export const listTaskStages = oc
  .route({
    path: '/api/v2/runs/{runId}/task-stages',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(ListTaskStagesInput)
  .output(z.object({
    status: z.literal(200),
    body: TaskStagesOutputSchema,
  }));
```

---

## 9. State Version

```typescript
// --- Input Types ---
const GetCurrentStateVersionInput = z.object({
  params: z.object({
    workspaceId: z.string().describe('Workspace ID'),
  }),
  headers: AuthHeadersSchema,
});

const GetStateVersionInput = z.object({
  params: z.object({
    stateVersionId: z.string().describe('State Version ID'),
  }),
  headers: AuthHeadersSchema,
});

const ListStateVersionsInput = z.object({
  params: z.object({
    workspaceId: z.string().describe('Workspace ID'),
  }),
  query: z.object({
    'page[number]': z.number().int().min(1).optional(),
    'page[size]': z.number().int().min(1).max(100).optional(),
  }).optional(),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const StateVersionOutputSchema = z.object({
  data: JsonApiDocument('state-versions', StateVersionAttributesSchema).shape.data.nullable(),
});
const StateVersionsOutputSchema = JsonApiCollection('state-versions', StateVersionAttributesSchema);

// --- Contracts ---
export const getCurrentStateVersion = oc
  .route({
    path: '/api/v2/workspaces/{workspaceId}/current-state-version',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetCurrentStateVersionInput)
  .output(z.object({
    status: z.literal(200),
    body: StateVersionOutputSchema,
  }));

export const getStateVersion = oc
  .route({
    path: '/api/v2/state-versions/{stateVersionId}',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetStateVersionInput)
  .output(z.object({
    status: z.literal(200),
    body: JsonApiDocument('state-versions', StateVersionAttributesSchema),
  }));

export const listStateVersions = oc
  .route({
    path: '/api/v2/workspaces/{workspaceId}/state-versions',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(ListStateVersionsInput)
  .output(z.object({
    status: z.literal(200),
    body: StateVersionsOutputSchema,
  }));
```

---

## 10. State Version Output

```typescript
// --- Input Types ---
const GetStateVersionOutputInput = z.object({
  params: z.object({
    stateVersionOutputId: z.string().describe('State Version Output ID'),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const StateVersionOutputOutputSchema = JsonApiDocument(
  'state-version-outputs',
  StateVersionOutputAttributesSchema
);

// --- Contract ---
export const getStateVersionOutput = oc
  .route({
    path: '/api/v2/state-version-outputs/{stateVersionOutputId}',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetStateVersionOutputInput)
  .output(z.object({
    status: z.literal(200),
    body: StateVersionOutputOutputSchema,
  }));
```

---

## 11. Cost Estimate

```typescript
// --- Input Types ---
const GetCostEstimateInput = z.object({
  params: z.object({
    costEstimateId: z.string().describe('Cost Estimate ID'),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const CostEstimateOutputSchema = JsonApiDocument('cost-estimates', CostEstimateAttributesSchema);

// --- Contract ---
export const getCostEstimate = oc
  .route({
    path: '/api/v2/cost-estimates/{costEstimateId}',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(GetCostEstimateInput)
  .output(z.object({
    status: z.literal(200),
    body: CostEstimateOutputSchema,
  }));
```

---

## 12. Organization Run Queue

```typescript
// --- Input Types ---
const ListOrganizationRunQueueInput = z.object({
  params: z.object({
    organization: z.string().describe('Organization name'),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---
const OrganizationRunQueueOutputSchema = z.object({
  data: z.array(z.object({
    type: z.literal('runs'),
    id: z.string(),
    attributes: z.object({
      status: RunAttributesSchema.shape.status,
      'position-in-queue': z.number().optional(),
    }),
  })),
});

// --- Contract ---
export const listOrganizationRunQueue = oc
  .route({
    path: '/api/v2/organizations/{organization}/runs/queue',
    method: 'GET',
    inputStructure: 'detailed',
    outputStructure: 'detailed',
  })
  .input(ListOrganizationRunQueueInput)
  .output(z.object({
    status: z.literal(200),
    body: OrganizationRunQueueOutputSchema,
  }));
```

---

## Contract Router

```typescript
export const terraformCloudContract = {
  organizations: {
    entitlements: {
      get: getOrganizationEntitlements,
    },
    runQueue: {
      list: listOrganizationRunQueue,
    },
  },
  workspaces: {
    get: getWorkspace,
    list: listWorkspaces,
  },
  configurationVersions: {
    create: createConfigurationVersion,
    get: getConfigurationVersion,
  },
  runs: {
    create: createRun,
    get: getRun,
    list: listRuns,
    actions: {
      apply: applyRun,
      discard: discardRun,
      cancel: cancelRun,
      forceCancel: forceCancelRun,
    },
  },
  plans: {
    get: getPlan,
    jsonOutput: getPlanJsonOutput,
  },
  applies: {
    get: getApply,
  },
  taskStages: {
    get: getTaskStage,
    list: listTaskStages,
  },
  stateVersions: {
    getCurrent: getCurrentStateVersion,
    get: getStateVersion,
    list: listStateVersions,
  },
  stateVersionOutputs: {
    get: getStateVersionOutput,
  },
  costEstimates: {
    get: getCostEstimate,
  },
};
```

---

## Type Inference

```typescript
import type { InferContractRouterInputs, InferContractRouterOutputs } from '@orpc/contract';

// Extract all input types
export type TerraformCloudInputs = InferContractRouterInputs<typeof terraformCloudContract>;

// Extract all output types
export type TerraformCloudOutputs = InferContractRouterOutputs<typeof terraformCloudContract>;

// Example usage:
type GetRunInput = TerraformCloudInputs['runs']['get'];
type GetRunOutput = TerraformCloudOutputs['runs']['get'];
type CreateConfigurationVersionInput = TerraformCloudInputs['configurationVersions']['create'];
```

---

## Usage Example

```typescript
import { implement } from '@orpc/server';
import { terraformCloudContract } from './contract';
import { deserializeRun, deserializeWorkspace } from './serde';

// Implement the contract
const terraformCloudRouter = implement(terraformCloudContract, {
  runs: {
    get: async ({ input }) => {
      const response = await fetch(
        `https://app.terraform.io/api/v2/runs/${input.params.runId}`,
        {
          headers: {
            Authorization: input.headers.authorization,
            'Content-Type': 'application/vnd.api+json',
          },
        }
      );

      const json = await response.json();
      const run = deserializeRun(json);

      return {
        status: 200 as const,
        body: json,
      };
    },
    // ... other implementations
  },
});
```

---

## Related Documentation

- [JSONAPI_SERDE_INTEGRATION.md](JSONAPI_SERDE_INTEGRATION.md) - Entity serialization/deserialization
- [minimal_api_schemas.md](minimal_api_schemas.md) - Complete Zod schema definitions
- [TERRAFORM_CLOUD_API_FLOW.md](TERRAFORM_CLOUD_API_FLOW.md) - API workflow documentation
- [oRPC Contract Documentation](https://orpc.dev/docs/contract-first/define-contract) - Official oRPC docs
- [oRPC OpenAPI Integration](https://orpc.dev/docs/openapi/input-output-structure) - Detailed mode documentation
