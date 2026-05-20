import { oc } from "@orpc/contract";
import { PingOutput } from "./ping.schema";

// --- Contracts ---

export const ping = oc
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
