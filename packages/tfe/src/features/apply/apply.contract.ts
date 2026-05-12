import { z } from "zod";
import { oc } from "@orpc/contract";
import { AuthHeadersSchema, JsonApiDocument } from "../../lib/common.schema";
import { ApplyAttributesSchema } from "./apply.schema";

// --- Input Types ---

const GetApplyInput = z.object({
  params: z.object({
    applyId: z.string().describe("Apply ID"),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---

const ApplyOutputSchema = JsonApiDocument("applies", ApplyAttributesSchema);

// --- Contract ---

export const getApply = oc
  .route({
    path: "/api/v2/applies/{applyId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetApplyInput)
  .output(
    z.object({
      status: z.literal(200),
      body: ApplyOutputSchema,
    })
  );

// --- Contract Router ---

export const applyContract = {
  get: getApply,
};
