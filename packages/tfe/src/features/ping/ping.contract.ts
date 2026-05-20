import { PingOutput } from "./ping.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const ping = createContract()
  .auth
  .route({
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
