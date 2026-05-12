import { z } from "zod";
import { type EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";

// Schema
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

// Type
export type Run = z.infer<typeof RunAttributesSchema> & {
  id: string;
  planId?: string;
  applyId?: string;
  workspaceId?: string;
  configurationVersionId?: string;
  costEstimateId?: string;
  taskStageIds?: string[];
};

// Serializer
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

// Deserializers
export const deserializeRun = createDeserializer({
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

export const deserializeRuns = createDeserializer({
  type: "runs",
  cardinality: "many",
  attributesSchema: RunAttributesSchema,
});
