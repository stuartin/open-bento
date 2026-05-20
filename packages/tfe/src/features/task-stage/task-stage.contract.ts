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
    path: "/task-stages/{taskStageId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetTaskStageInput)
  .output(GetTaskStageOutput);

export const listTaskStages = oc
  .route({
    path: "/runs/{runId}/task-stages",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListTaskStagesInput)
  .output(ListTaskStagesOutput);

// --- Contract Router ---

export const taskStageContract = {
  get: getTaskStage,
  list: listTaskStages,
};
