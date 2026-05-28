import { z } from "zod";
import { AuthHeadersSchema, JsonApiCollection, JsonApiDocument, ORPCInput, ORPCOutput, RESOURCE } from "../../lib/common.schema";

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

export const TaskStageResourceSchema = JsonApiDocument(
  RESOURCE.TASK_STAGES,
  TaskStageAttributesSchema
)

export const TaskStageCollectionSchema = JsonApiCollection(
  RESOURCE.TASK_STAGES,
  TaskStageAttributesSchema
)

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Task Stage ---

export const GetTaskStageInput = ORPCInput({
  params: z.object({
    stage: z.string().describe("Task Stage ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetTaskStageOutput = ORPCOutput({
  status: z.literal(200),
  body: TaskStageResourceSchema
});

// --- List Task Stages ---

export const ListTaskStagesInput = ORPCInput({
  params: z.object({
    run: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
});

export const ListTaskStagesOutput = ORPCOutput({
  status: z.literal(200),
  body: TaskStageCollectionSchema
});

// ============================================================
// Type
// ============================================================

export type TaskStage = z.infer<typeof TaskStageResourceSchema>
