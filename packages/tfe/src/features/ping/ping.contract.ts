import { PingOutput } from "./ping.schema";
import { createContract } from "../../lib/contract";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.ORGANIZATION]

export const ping = createContract()
  .pub
  .route({
    tags,
    path: "/ping",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .output(PingOutput);

// --- Contract Router ---

export const pingContract = {
  ping
};
