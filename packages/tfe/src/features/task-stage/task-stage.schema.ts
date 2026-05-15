import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// --- Attributes Schema ---

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

export type TaskStage = z.infer<typeof TaskStageAttributesSchema> & {
  id: string;
  taskResultIds?: string[];
  policyEvaluationIds?: string[];
};

// --- Get Task Stage ---

export const GetTaskStageInput = z.object({
  params: z.object({
    taskStageId: z.string().describe("Task Stage ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetTaskStageOutput = z.object({
  data: z.object({
    type: z.literal("task-stages"),
    id: z.string(),
    attributes: TaskStageAttributesSchema,
  }),
});

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

// Backward compatibility exports
export const serializeGetTaskStageOutput = serializeTaskStage;
export const deserializeGetTaskStageOutput = deserializeTaskStage;

// --- List Task Stages ---

export const ListTaskStagesInput = z.object({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
});

export const ListTaskStagesOutput = z.object({
  data: z.array(
    z.object({
      type: z.literal("task-stages"),
      id: z.string(),
      attributes: TaskStageAttributesSchema,
    })
  ),
});

export const serializeListTaskStagesOutput = serializeTaskStage;

export const deserializeListTaskStagesOutput = createDeserializer({
  type: "task-stages",
  cardinality: "many",
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
