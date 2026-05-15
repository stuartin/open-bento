import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION
// ============================================================

export const TaskResultAttributesSchema = z.object({
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

export type TaskResult = z.infer<typeof TaskResultAttributesSchema> & {
  id: string;
};

export const serializeTaskResult: EntitySerializer<TaskResult> = {
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

export const deserializeTaskResult = createDeserializer({
  type: "task-results",
  cardinality: "one",
  attributesSchema: TaskResultAttributesSchema,
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Task Result ---

export const GetTaskResultInput = z.object({
  params: z.object({
    taskResultId: z.string().describe("Task Result ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetTaskResultOutput = z.object({
  data: z.object({
    type: z.literal("task-results"),
    id: z.string(),
    attributes: TaskResultAttributesSchema,
  }),
});
