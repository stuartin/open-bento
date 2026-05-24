import { z } from "zod";
import { AuthHeadersSchema, JsonApiDocument, ORPCInput, ORPCOutput } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Task Result
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

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Task Result ---

export const GetTaskResultInput = ORPCInput({
  params: z.object({
    taskResultId: z.string().describe("Task Result ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetTaskResultOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    "task-results",
    TaskResultAttributesSchema
  ),
});
