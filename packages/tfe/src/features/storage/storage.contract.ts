import {
  CreateDownloadInput,
  CreateDownloadOutput,
  CreateUploadInput,
} from "./storage.schema";
import { createContract } from "../../lib/contract";
import { NOT_FOUND } from "../../lib/errors";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.CONFIGURATION_VERSION]

export const uploadFile = createContract()
  .auth
  .route({
    tags,
    path: "/uploads",
    method: "PUT",
    inputStructure: "detailed",
  })
  .input(CreateUploadInput)
  .errors({ NOT_FOUND })

export const downloadFile = createContract()
  .pub
  .route({
    tags,
    path: "/downloads",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed"
  })
  .input(CreateDownloadInput)
  .output(CreateDownloadOutput)
  .errors({ NOT_FOUND })

// --- Contract Router ---

export const storageContract = {
  upload: uploadFile,
  download: downloadFile
};
