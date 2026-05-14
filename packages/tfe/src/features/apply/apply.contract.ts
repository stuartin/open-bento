import { z } from "zod";
import { oc } from "@orpc/contract";
import { GetApplyInput, GetApplyOutput } from "./apply.schema";

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
      body: GetApplyOutput,
    })
  );

// --- Contract Router ---

export const applyContract = {
  get: getApply,
};
