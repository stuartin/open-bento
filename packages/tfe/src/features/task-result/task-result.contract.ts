import { z } from "zod";
import { oc } from "@orpc/contract";
import { AuthHeadersSchema, JsonApiDocument } from "../../lib/common.schema";
import { TaskResultAttributesSchema } from "./task-result.schema";

// --- Input Types ---

const GetTaskResultInput = z.object({
  params: z.object({
    taskResultId: z.string().describe("Task Result ID"),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---

const TaskResultOutputSchema = JsonApiDocument(
  "task-results",
  TaskResultAttributesSchema
);

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
      body: TaskResultOutputSchema,
    })
  );

// --- Contract Router ---

export const taskResultContract = {
  get: getTaskResult,
};
