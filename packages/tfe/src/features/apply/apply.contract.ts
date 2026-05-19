import { oc } from "@orpc/contract";
import { GetApplyInput, GetApplyOutput } from "./apply.schema";

// --- Contracts ---

export const getApply = oc
  .route({
    path: "/api/v2/applies/{applyId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetApplyInput)
  .output(GetApplyOutput);

// --- Contract Router ---

export const applyContract = {
  get: getApply,
};
