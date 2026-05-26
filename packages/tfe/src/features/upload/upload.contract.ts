import {
  CreateUploadInput,
} from "./upload.schema";
import { createContract } from "../../lib/contract";
import { NOT_FOUND } from "../../lib/errors";

// --- Contracts ---

export const createUpload = createContract()
  .auth
  .route({
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
