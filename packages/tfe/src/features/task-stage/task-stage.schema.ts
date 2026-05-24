import { z } from "zod";
import { AuthHeadersSchema, JsonApiCollection, JsonApiDocument, ORPCInput, ORPCOutput } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Task Stage
// ============================================================

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

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Task Stage ---

export const GetTaskStageInput = ORPCInput({
  params: z.object({
    taskStageId: z.string().describe("Task Stage ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetTaskStageOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    "task-stages",
    TaskStageAttributesSchema
  ),
});

// --- List Task Stages ---

export const ListTaskStagesInput = ORPCInput({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
});

export const ListTaskStagesOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiCollection(
    "task-stages",
    TaskStageAttributesSchema
  ),
});
