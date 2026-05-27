import { GetApplyInput, GetApplyOutput } from "./apply.schema";
import { createContract } from "../../lib/contract";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.APPLY]

export const getApply = createContract()
  .auth
  .route({
    tags,
    path: "/applies/{apply}",
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
