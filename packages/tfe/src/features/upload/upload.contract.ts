import {
  CreateUploadInput,
} from "./upload.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const createUpload = createContract()
  .auth
  .route({
    path: "/uploads",
    method: "PUT",
    inputStructure: "detailed",
  })
  .input(CreateUploadInput)

// --- Contract Router ---

export const uploadContract = {
  uploadFile: createUpload,
};
