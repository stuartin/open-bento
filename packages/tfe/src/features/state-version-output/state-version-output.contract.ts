import { z } from "zod";
import { oc } from "@orpc/contract";
import { AuthHeadersSchema, JsonApiDocument } from "../../lib/common.schema";
import { StateVersionOutputAttributesSchema } from "./state-version-output.schema";

// --- Input Types ---

const GetStateVersionOutputInput = z.object({
  params: z.object({
    stateVersionOutputId: z.string().describe("State Version Output ID"),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---

const StateVersionOutputOutputSchema = JsonApiDocument(
  "state-version-outputs",
  StateVersionOutputAttributesSchema
);

// --- Contract ---

export const getStateVersionOutput = oc
  .route({
    path: "/api/v2/state-version-outputs/{stateVersionOutputId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetStateVersionOutputInput)
  .output(
    z.object({
      status: z.literal(200),
      body: StateVersionOutputOutputSchema,
    })
  );

// --- Contract Router ---

export const stateVersionOutputContract = {
  get: getStateVersionOutput,
};
