# Terraform Cloud API - JSON:API Serde Integration

This document demonstrates how to use the `@jsonapi-serde` package with Zod schemas to serialize and deserialize Terraform Cloud API entities.

## Installation

```bash
npm install @jsonapi-serde/server @jsonapi-serde/client zod
```

## Package Overview

The `@jsonapi-serde` library has two separate packages:

- **`@jsonapi-serde/server`**: For serialization (creating request bodies)
- **`@jsonapi-serde/client`**: For deserialization (parsing responses)

---

## Workspace

### Schema

```typescript
import { z } from "zod";

const WorkspaceAttributesSchema = z.object({
  name: z.string(),
  "execution-mode": z.enum(["remote", "local", "agent"]),
  "terraform-version": z.string().nullable(),
  locked: z.boolean().optional(),
});
```

### Type

```typescript
type Workspace = z.infer<typeof WorkspaceAttributesSchema> & {
  id: string;
  organizationId?: string;
  currentStateVersionId?: string;
};
```

### Serializer

```typescript
import { type EntitySerializer } from "@jsonapi-serde/server";

const serializeWorkspace: EntitySerializer<Workspace> = {
  getId: (workspace) => workspace.id,
  serialize: (workspace) => ({
    attributes: {
      name: workspace.name,
      "execution-mode": workspace["execution-mode"],
      "terraform-version": workspace["terraform-version"],
      locked: workspace.locked,
    },
    relationships: {
      ...(workspace.organizationId && {
        organization: {
          data: { type: "organizations", id: workspace.organizationId },
        },
      }),
      ...(workspace.currentStateVersionId && {
        "current-state-version": {
          data: { type: "state-versions", id: workspace.currentStateVersionId },
        },
      }),
    },
  }),
};
```

### Deserializer

```typescript
import { createDeserializer } from "@jsonapi-serde/client";

const deserializeWorkspace = createDeserializer({
  type: "workspaces",
  cardinality: "one",
  attributesSchema: WorkspaceAttributesSchema,
  relationships: {
    organization: {
      type: "organizations",
      cardinality: "one",
    },
    "current-state-version": {
      type: "state-versions",
      cardinality: "one",
    },
  },
});

const deserializeWorkspaces = createDeserializer({
  type: "workspaces",
  cardinality: "many",
  attributesSchema: WorkspaceAttributesSchema,
});
```

---

## Configuration Version

### Schema

```typescript
const ConfigurationVersionAttributesSchema = z.object({
  "auto-queue-runs": z.boolean(),
  speculative: z.boolean(),
  provisional: z.boolean(),
  status: z.enum(["pending", "uploaded", "errored"]),
  "upload-url": z.string(),
});
```

### Type

```typescript
type ConfigurationVersion = z.infer<
  typeof ConfigurationVersionAttributesSchema
> & {
  id: string;
};
```

### Serializer

```typescript
const serializeConfigurationVersion: EntitySerializer<ConfigurationVersion> = {
  getId: (cv) => cv.id,
  serialize: (cv) => ({
    attributes: {
      "auto-queue-runs": cv["auto-queue-runs"],
      speculative: cv.speculative,
      provisional: cv.provisional,
      status: cv.status,
      "upload-url": cv["upload-url"],
    },
  }),
};
```

### Deserializer

```typescript
const deserializeConfigurationVersion = createDeserializer({
  type: "configuration-versions",
  cardinality: "one",
  attributesSchema: ConfigurationVersionAttributesSchema,
});
```

---

## Run

### Schema

```typescript
const RunAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "plan_queued",
    "planning",
    "planned",
    "cost_estimating",
    "cost_estimated",
    "policy_checking",
    "policy_override",
    "policy_soft_failed",
    "policy_checked",
    "confirmed",
    "post_plan_running",
    "post_plan_completed",
    "planned_and_finished",
    "apply_queued",
    "applying",
    "applied",
    "discarded",
    "errored",
    "canceled",
    "force_canceled",
  ]),
  "has-changes": z.boolean(),
  "is-destroy": z.boolean().optional(),
  message: z.string().nullable().optional(),
  "created-at": z.string().optional(),
  "position-in-queue": z.number().optional(),
  actions: z.object({
    "is-cancelable": z.boolean(),
    "is-confirmable": z.boolean(),
    "is-discardable": z.boolean(),
    "is-force-cancelable": z.boolean().optional(),
  }),
});
```

### Type

```typescript
type Run = z.infer<typeof RunAttributesSchema> & {
  id: string;
  planId?: string;
  applyId?: string;
  workspaceId?: string;
  configurationVersionId?: string;
  costEstimateId?: string;
  taskStageIds?: string[];
};
```

### Serializer

```typescript
const serializeRun: EntitySerializer<Run> = {
  getId: (run) => run.id,
  serialize: (run) => ({
    attributes: {
      status: run.status,
      "has-changes": run["has-changes"],
      "is-destroy": run["is-destroy"],
      message: run.message,
      "created-at": run["created-at"],
      "position-in-queue": run["position-in-queue"],
      actions: run.actions,
    },
    relationships: {
      ...(run.planId && {
        plan: {
          data: { type: "plans", id: run.planId },
        },
      }),
      ...(run.applyId && {
        apply: {
          data: { type: "applies", id: run.applyId },
        },
      }),
      ...(run.workspaceId && {
        workspace: {
          data: { type: "workspaces", id: run.workspaceId },
        },
      }),
      ...(run.configurationVersionId && {
        "configuration-version": {
          data: {
            type: "configuration-versions",
            id: run.configurationVersionId,
          },
        },
      }),
      ...(run.costEstimateId && {
        "cost-estimate": {
          data: { type: "cost-estimates", id: run.costEstimateId },
        },
      }),
      ...(run.taskStageIds && {
        "task-stages": {
          data: run.taskStageIds.map((id) => ({ type: "task-stages", id })),
        },
      }),
    },
  }),
};
```

### Deserializer

```typescript
const deserializeRun = createDeserializer({
  type: "runs",
  cardinality: "one",
  attributesSchema: RunAttributesSchema,
  relationships: {
    plan: {
      type: "plans",
      cardinality: "one",
    },
    apply: {
      type: "applies",
      cardinality: "one",
    },
    workspace: {
      type: "workspaces",
      cardinality: "one",
    },
    "configuration-version": {
      type: "configuration-versions",
      cardinality: "one",
    },
    "cost-estimate": {
      type: "cost-estimates",
      cardinality: "one",
    },
    "task-stages": {
      type: "task-stages",
      cardinality: "many",
    },
  },
});

const deserializeRuns = createDeserializer({
  type: "runs",
  cardinality: "many",
  attributesSchema: RunAttributesSchema,
});
```

---

## Plan

### Schema

```typescript
const PlanAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "managed_queued",
    "queued",
    "agent_queued",
    "running",
    "errored",
    "canceled",
    "finished",
    "unreachable",
  ]),
  "generated-configuration": z.boolean().optional(),
  "log-read-url": z.string().optional(),
  "has-changes": z.boolean().optional(),
  "resource-additions": z.number().optional(),
  "resource-changes": z.number().optional(),
  "resource-destructions": z.number().optional(),
});
```

### Type

```typescript
type Plan = z.infer<typeof PlanAttributesSchema> & {
  id: string;
};
```

### Serializer

```typescript
const serializePlan: EntitySerializer<Plan> = {
  getId: (plan) => plan.id,
  serialize: (plan) => ({
    attributes: {
      status: plan.status,
      "generated-configuration": plan["generated-configuration"],
      "log-read-url": plan["log-read-url"],
      "has-changes": plan["has-changes"],
      "resource-additions": plan["resource-additions"],
      "resource-changes": plan["resource-changes"],
      "resource-destructions": plan["resource-destructions"],
    },
  }),
};
```

### Deserializer

```typescript
const deserializePlan = createDeserializer({
  type: "plans",
  cardinality: "one",
  attributesSchema: PlanAttributesSchema,
});
```

---

## Apply

### Schema

```typescript
const ApplyAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "managed_queued",
    "queued",
    "agent_queued",
    "running",
    "errored",
    "canceled",
    "finished",
    "unreachable",
  ]),
  "log-read-url": z.string().optional(),
  "resource-additions": z.number().optional(),
  "resource-changes": z.number().optional(),
  "resource-destructions": z.number().optional(),
});
```

### Type

```typescript
type Apply = z.infer<typeof ApplyAttributesSchema> & {
  id: string;
};
```

### Serializer

```typescript
const serializeApply: EntitySerializer<Apply> = {
  getId: (apply) => apply.id,
  serialize: (apply) => ({
    attributes: {
      status: apply.status,
      "log-read-url": apply["log-read-url"],
      "resource-additions": apply["resource-additions"],
      "resource-changes": apply["resource-changes"],
      "resource-destructions": apply["resource-destructions"],
    },
  }),
};
```

### Deserializer

```typescript
const deserializeApply = createDeserializer({
  type: "applies",
  cardinality: "one",
  attributesSchema: ApplyAttributesSchema,
});
```

---

## Task Stage

### Schema

```typescript
const TaskStageAttributesSchema = z.object({
  stage: z.enum(["pre_plan", "post_plan", "pre_apply"]),
  status: z.enum([
    "pending",
    "running",
    "passed",
    "failed",
    "awaiting_override",
    "overridden",
    "unreachable",
    "canceled",
    "errored",
  ]),
  "created-at": z.string().optional(),
  "updated-at": z.string().optional(),
});
```

### Type

```typescript
type TaskStage = z.infer<typeof TaskStageAttributesSchema> & {
  id: string;
  taskResultIds?: string[];
  policyEvaluationIds?: string[];
};
```

### Serializer

```typescript
const serializeTaskStage: EntitySerializer<TaskStage> = {
  getId: (taskStage) => taskStage.id,
  serialize: (taskStage) => ({
    attributes: {
      stage: taskStage.stage,
      status: taskStage.status,
      "created-at": taskStage["created-at"],
      "updated-at": taskStage["updated-at"],
    },
    relationships: {
      ...(taskStage.taskResultIds && {
        "task-results": {
          data: taskStage.taskResultIds.map((id) => ({
            type: "task-results",
            id,
          })),
        },
      }),
      ...(taskStage.policyEvaluationIds && {
        "policy-evaluations": {
          data: taskStage.policyEvaluationIds.map((id) => ({
            type: "policy-evaluations",
            id,
          })),
        },
      }),
    },
  }),
};
```

### Deserializer

```typescript
const deserializeTaskStage = createDeserializer({
  type: "task-stages",
  cardinality: "one",
  attributesSchema: TaskStageAttributesSchema,
  relationships: {
    "task-results": {
      type: "task-results",
      cardinality: "many",
    },
    "policy-evaluations": {
      type: "policy-evaluations",
      cardinality: "many",
    },
  },
});

const deserializeTaskStages = createDeserializer({
  type: "task-stages",
  cardinality: "many",
  attributesSchema: TaskStageAttributesSchema,
});
```

---

## State Version

### Schema

```typescript
const StateVersionAttributesSchema = z.object({
  "created-at": z.string(),
  serial: z.number(),
  status: z.enum(["pending", "finalized", "discarded"]),
  "hosted-state-download-url": z.string(),
});
```

### Type

```typescript
type StateVersion = z.infer<typeof StateVersionAttributesSchema> & {
  id: string;
  outputIds?: string[];
};
```

### Serializer

```typescript
const serializeStateVersion: EntitySerializer<StateVersion> = {
  getId: (sv) => sv.id,
  serialize: (sv) => ({
    attributes: {
      "created-at": sv["created-at"],
      serial: sv.serial,
      status: sv.status,
      "hosted-state-download-url": sv["hosted-state-download-url"],
    },
    relationships: {
      ...(sv.outputIds && {
        outputs: {
          data: sv.outputIds.map((id) => ({
            type: "state-version-outputs",
            id,
          })),
        },
      }),
    },
  }),
};
```

### Deserializer

```typescript
const deserializeStateVersion = createDeserializer({
  type: "state-versions",
  cardinality: "one",
  attributesSchema: StateVersionAttributesSchema,
  relationships: {
    outputs: {
      type: "state-version-outputs",
      cardinality: "many",
      included: {
        attributesSchema: StateVersionOutputAttributesSchema,
      },
    },
  },
});
```

---

## State Version Output

### Schema

```typescript
const StateVersionOutputAttributesSchema = z.object({
  name: z.string(),
  sensitive: z.boolean(),
  value: z.any(),
  "detailed-type": z.string().nullable(),
});
```

### Type

```typescript
type StateVersionOutput = z.infer<typeof StateVersionOutputAttributesSchema> & {
  id: string;
};
```

### Serializer

```typescript
const serializeStateVersionOutput: EntitySerializer<StateVersionOutput> = {
  getId: (output) => output.id,
  serialize: (output) => ({
    attributes: {
      name: output.name,
      sensitive: output.sensitive,
      value: output.value,
      "detailed-type": output["detailed-type"],
    },
  }),
};
```

### Deserializer

```typescript
// State version outputs are typically included in state version responses
// See deserializeStateVersion above for included outputs
```

---

## Organization

### Schema

```typescript
const OrganizationAttributesSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  "external-id": z.string().optional(),
});
```

### Type

```typescript
type Organization = z.infer<typeof OrganizationAttributesSchema> & {
  id: string;
};
```

### Serializer

```typescript
const serializeOrganization: EntitySerializer<Organization> = {
  getId: (org) => org.id,
  serialize: (org) => ({
    attributes: {
      name: org.name,
      email: org.email,
      "external-id": org["external-id"],
    },
  }),
};
```

### Deserializer

```typescript
const deserializeOrganization = createDeserializer({
  type: "organizations",
  cardinality: "one",
  attributesSchema: OrganizationAttributesSchema,
});
```

---

## Cost Estimate

### Schema

```typescript
const CostEstimateAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "queued",
    "running",
    "finished",
    "errored",
    "canceled",
    "skipped",
  ]),
  "matched-resources-count": z.number().optional(),
  "unmatched-resources-count": z.number().optional(),
  "resources-count": z.number().optional(),
  "delta-monthly-cost": z.string().optional(),
  "proposed-monthly-cost": z.string().optional(),
});
```

### Type

```typescript
type CostEstimate = z.infer<typeof CostEstimateAttributesSchema> & {
  id: string;
};
```

### Serializer

```typescript
const serializeCostEstimate: EntitySerializer<CostEstimate> = {
  getId: (ce) => ce.id,
  serialize: (ce) => ({
    attributes: {
      status: ce.status,
      "matched-resources-count": ce["matched-resources-count"],
      "unmatched-resources-count": ce["unmatched-resources-count"],
      "resources-count": ce["resources-count"],
      "delta-monthly-cost": ce["delta-monthly-cost"],
      "proposed-monthly-cost": ce["proposed-monthly-cost"],
    },
  }),
};
```

### Deserializer

```typescript
const deserializeCostEstimate = createDeserializer({
  type: "cost-estimates",
  cardinality: "one",
  attributesSchema: CostEstimateAttributesSchema,
});
```

---

## Task Result

### Schema

```typescript
const TaskResultAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "running",
    "passed",
    "failed",
    "errored",
    "canceled",
    "unreachable",
  ]),
  message: z.string().optional(),
  "task-name": z.string().optional(),
  "task-url": z.string().optional(),
  "created-at": z.string().optional(),
  "updated-at": z.string().optional(),
});
```

### Type

```typescript
type TaskResult = z.infer<typeof TaskResultAttributesSchema> & {
  id: string;
};
```

### Serializer

```typescript
const serializeTaskResult: EntitySerializer<TaskResult> = {
  getId: (tr) => tr.id,
  serialize: (tr) => ({
    attributes: {
      status: tr.status,
      message: tr.message,
      "task-name": tr["task-name"],
      "task-url": tr["task-url"],
      "created-at": tr["created-at"],
      "updated-at": tr["updated-at"],
    },
  }),
};
```

### Deserializer

```typescript
const deserializeTaskResult = createDeserializer({
  type: "task-results",
  cardinality: "one",
  attributesSchema: TaskResultAttributesSchema,
});
```

---

## Policy Evaluation

### Schema

```typescript
const PolicyEvaluationAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "running",
    "passed",
    "failed",
    "errored",
    "canceled",
    "unreachable",
  ]),
  "policy-kind": z.enum(["opa", "sentinel"]),
  "result-count": z
    .object({
      "advisory-failed": z.number(),
      "mandatory-failed": z.number(),
      passed: z.number(),
      errored: z.number(),
    })
    .optional(),
  "created-at": z.string().optional(),
  "updated-at": z.string().optional(),
});
```

### Type

```typescript
type PolicyEvaluation = z.infer<typeof PolicyEvaluationAttributesSchema> & {
  id: string;
};
```

### Serializer

```typescript
const serializePolicyEvaluation: EntitySerializer<PolicyEvaluation> = {
  getId: (pe) => pe.id,
  serialize: (pe) => ({
    attributes: {
      status: pe.status,
      "policy-kind": pe["policy-kind"],
      "result-count": pe["result-count"],
      "created-at": pe["created-at"],
      "updated-at": pe["updated-at"],
    },
  }),
};
```

### Deserializer

```typescript
const deserializePolicyEvaluation = createDeserializer({
  type: "policy-evaluations",
  cardinality: "one",
  attributesSchema: PolicyEvaluationAttributesSchema,
});
```

---

## Unified Serializer

```typescript
import { SerializeBuilder } from "@jsonapi-serde/server";

// Single serializer for all entity types
const serialize = SerializeBuilder.new()
  .add("workspaces", serializeWorkspace)
  .add("configuration-versions", serializeConfigurationVersion)
  .add("runs", serializeRun)
  .add("plans", serializePlan)
  .add("applies", serializeApply)
  .add("task-stages", serializeTaskStage)
  .add("state-versions", serializeStateVersion)
  .add("state-version-outputs", serializeStateVersionOutput)
  .add("organizations", serializeOrganization)
  .add("cost-estimates", serializeCostEstimate)
  .add("task-results", serializeTaskResult)
  .add("policy-evaluations", serializePolicyEvaluation)
  .build();
```

---

## Error Handling

```typescript
import { handleJsonApiError } from "@jsonapi-serde/client";

const response = await fetch("/api/v2/runs/run-123", {
  headers: { Authorization: `Bearer ${token}` },
});

await handleJsonApiError(response);

const json = await response.json();
const run = deserializeRun(json);
```

---

## Related Documentation

- [MINIMAL_API_SCHEMAS.md](MINIMAL_API_SCHEMAS.md) - Zod schema definitions
- [TERRAFORM_CLOUD_API_FLOW.md](TERRAFORM_CLOUD_API_FLOW.md) - API workflow
- [@jsonapi-serde Documentation](https://jsonapi-serde.js.org/) - Official docs
