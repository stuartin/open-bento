import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";

// Schema
export const TaskStageAttributesSchema = z.object({
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

// Type
export type TaskStage = z.infer<typeof TaskStageAttributesSchema> & {
  id: string;
  taskResultIds?: string[];
  policyEvaluationIds?: string[];
};

// Serializer
export const serializeTaskStage: EntitySerializer<TaskStage> = {
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

// Deserializers
export const deserializeTaskStage = createDeserializer({
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

export const deserializeTaskStages = createDeserializer({
  type: "task-stages",
  cardinality: "many",
  attributesSchema: TaskStageAttributesSchema,
});
