import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";
import { PlanAttributesSchema } from "../plan/plan.schema";
import { ApplyAttributesSchema } from "../apply/apply.schema";
import { WorkspaceAttributesSchema } from "../workspace/workspace.schema";
import { ConfigurationVersionAttributesSchema } from "../configuration-version/configuration-version.schema";
import { CostEstimateAttributesSchema } from "../cost-estimate/cost-estimate.schema";
import { TaskStageAttributesSchema } from "../task-stage/task-stage.schema";

// ============================================================
// ENTITY DEFINITION
// ============================================================

export const RunAttributesSchema = z.object({
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

export type Run = z.infer<typeof RunAttributesSchema> & {
  id: string;
  planId?: string;
  applyId?: string;
  workspaceId?: string;
  configurationVersionId?: string;
  costEstimateId?: string;
  taskStageIds?: string[];
};

export const serializeRun: EntitySerializer<Run> = {
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

export const deserializeRun = createDeserializer({
  type: "runs",
  cardinality: "one",
  attributesSchema: RunAttributesSchema,
  relationships: {
    plan: {
      type: "plans",
      cardinality: "one",
      included: {
        attributesSchema: PlanAttributesSchema,
      },
    },
    apply: {
      type: "applies",
      cardinality: "one",
      included: {
        attributesSchema: ApplyAttributesSchema,
      },
    },
    workspace: {
      type: "workspaces",
      cardinality: "one",
      included: {
        attributesSchema: WorkspaceAttributesSchema,
      },
    },
    "configuration-version": {
      type: "configuration-versions",
      cardinality: "one",
      included: {
        attributesSchema: ConfigurationVersionAttributesSchema,
      },
    },
    "cost-estimate": {
      type: "cost-estimates",
      cardinality: "one",
      included: {
        attributesSchema: CostEstimateAttributesSchema,
      },
    },
    "task-stages": {
      type: "task-stages",
      cardinality: "many",
      included: {
        attributesSchema: TaskStageAttributesSchema,
      },
    },
  },
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Create Run ---

export const CreateRunInput = z.object({
  headers: AuthHeadersSchema,
  body: z.object({
    data: z.object({
      type: z.literal("runs"),
      attributes: z.object({
        "auto-apply": z.boolean().default(false),
        refresh: z.boolean().default(true),
        "save-plan": z.boolean().default(false),
        message: z.string().optional(),
        variables: z
          .array(
            z.object({
              key: z.string(),
              value: z.string(),
            })
          )
          .optional(),
      }),
      relationships: z.object({
        "configuration-version": z.object({
          data: z.object({
            type: z.literal("configuration-versions"),
            id: z.string(),
          }),
        }),
        workspace: z
          .object({
            data: z.object({
              type: z.literal("workspaces"),
              id: z.string(),
            }),
          })
          .optional(),
      }),
    }),
  }),
});

export const CreateRunOutput = z.object({
  data: z.object({
    type: z.literal("runs"),
    id: z.string(),
    attributes: RunAttributesSchema,
  }),
});

// --- Get Run ---

export const GetRunInput = z.object({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetRunOutput = z.object({
  data: z.object({
    type: z.literal("runs"),
    id: z.string(),
    attributes: RunAttributesSchema,
  }),
});

// --- List Runs ---

export const ListRunsInput = z.object({
  params: z.object({
    workspaceId: z.string().describe("Workspace ID"),
  }),
  query: z
    .object({
      "page[number]": z.number().int().min(1).optional(),
      "page[size]": z.number().int().min(1).max(100).optional(),
    })
    .optional(),
  headers: AuthHeadersSchema,
});

export const ListRunsOutput = z.object({
  data: z.array(
    z.object({
      type: z.literal("runs"),
      id: z.string(),
      attributes: RunAttributesSchema,
    })
  ),
});

// --- Apply Run ---

export const ApplyRunInput = z.object({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
  body: z
    .object({
      comment: z.string().optional(),
    })
    .optional(),
});

// --- Discard Run ---

export const DiscardRunInput = z.object({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
  body: z
    .object({
      comment: z.string().optional(),
    })
    .optional(),
});

// --- Cancel Run ---

export const CancelRunInput = z.object({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
  body: z
    .object({
      comment: z.string().optional(),
    })
    .optional(),
});

// --- Force Cancel Run ---

export const ForceCancelRunInput = z.object({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
  body: z
    .object({
      comment: z.string().optional(),
    })
    .optional(),
});
