import { GetApplyInput, GetApplyOutput } from "./apply.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const getApply = createContract()
  .auth
  .route({
    path: "/applies/{applyId}",
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
