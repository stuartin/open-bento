import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  AuthHeadersSchema,
  JsonApiDocument,
  JsonApiCollection,
} from "../../lib/common.schema";
import { TaskStageAttributesSchema } from "./task-stage.schema";

// --- Input Types ---

const GetTaskStageInput = z.object({
  params: z.object({
    taskStageId: z.string().describe("Task Stage ID"),
  }),
  headers: AuthHeadersSchema,
});

const ListTaskStagesInput = z.object({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---

const TaskStageOutputSchema = JsonApiDocument(
  "task-stages",
  TaskStageAttributesSchema
);
const TaskStagesOutputSchema = JsonApiCollection(
  "task-stages",
  TaskStageAttributesSchema
);

// --- Contracts ---

export const getTaskStage = oc
  .route({
    path: "/api/v2/task-stages/{taskStageId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetTaskStageInput)
  .output(
    z.object({
      status: z.literal(200),
      body: TaskStageOutputSchema,
    })
  );

export const listTaskStages = oc
  .route({
    path: "/api/v2/runs/{runId}/task-stages",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListTaskStagesInput)
  .output(
    z.object({
      status: z.literal(200),
      body: TaskStagesOutputSchema,
    })
  );

// --- Contract Router ---

export const taskStageContract = {
  get: getTaskStage,
  list: listTaskStages,
};
