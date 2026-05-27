import {
  CreateUploadInput,
} from "./upload.schema";
import { createContract } from "../../lib/contract";
import { NOT_FOUND } from "../../lib/errors";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.CONFIGURATION_VERSION]

export const createUpload = createContract()
  .auth
  .route({
    tags,
    path: "/uploads",
    method: "PUT",
    inputStructure: "detailed",
  })
  .input(CreateUploadInput)
  .errors({ NOT_FOUND })

// --- Contract Router ---

export const uploadContract = {
  uploadFile: createUpload,
};
