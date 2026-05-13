import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";

// Schema
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

// Type
export type TaskResult = z.infer<typeof TaskResultAttributesSchema> & {
  id: string;
};

// Serializer
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

// Deserializer
export const deserializeTaskResult = createDeserializer({
  type: "task-results",
  cardinality: "one",
  attributesSchema: TaskResultAttributesSchema,
});
