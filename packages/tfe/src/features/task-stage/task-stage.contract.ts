import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  GetTaskStageInput,
  GetTaskStageOutput,
  ListTaskStagesInput,
  ListTaskStagesOutput,
} from "./task-stage.schema";

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
      body: GetTaskStageOutput,
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
      body: ListTaskStagesOutput,
    })
  );

// --- Contract Router ---

export const taskStageContract = {
  get: getTaskStage,
  list: listTaskStages,
};
