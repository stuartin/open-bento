import {
  GetTaskStageInput,
  GetTaskStageOutput,
  ListTaskStagesInput,
  ListTaskStagesOutput,
} from "./task-stage.schema";
import { createContract } from "../../lib/contract";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.TASK_STAGE]

export const getTaskStage = createContract()
  .auth
  .route({
    tags,
    path: "/task-stages/{stage}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetTaskStageInput)
  .output(GetTaskStageOutput);

export const listTaskStages = createContract()
  .auth
  .route({
    tags,
    path: "/runs/{run}/task-stages",
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
