import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  GetTaskResultInput,
  GetTaskResultOutput,
} from "./task-result.schema";

// --- Contract ---

export const getTaskResult = oc
  .route({
    path: "/api/v2/task-results/{taskResultId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetTaskResultInput)
  .output(
    z.object({
      status: z.literal(200),
      body: GetTaskResultOutput,
    })
  );

// --- Contract Router ---

export const taskResultContract = {
  get: getTaskResult,
};
