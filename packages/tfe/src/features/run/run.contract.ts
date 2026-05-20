import {
  CreateRunInput,
  CreateRunOutput,
  GetRunInput,
  GetRunOutput,
  ListRunsInput,
  ListRunsOutput,
  ApplyRunInput,
  ApplyRunOutput,
  DiscardRunInput,
  DiscardRunOutput,
  CancelRunInput,
  CancelRunOutput,
  ForceCancelRunInput,
  ForceCancelRunOutput,
} from "./run.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const createRun = createContract()
  .auth
  .route({
    path: "/runs",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CreateRunInput)
  .output(CreateRunOutput);

export const getRun = createContract()
  .auth
  .route({
    path: "/runs/{runId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetRunInput)
  .output(GetRunOutput);

export const listRuns = createContract()
  .auth
  .route({
    path: "/workspaces/{workspaceId}/runs",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListRunsInput)
  .output(ListRunsOutput);

export const applyRun = createContract()
  .auth
  .route({
    path: "/runs/{runId}/actions/apply",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ApplyRunInput)
  .output(ApplyRunOutput);

export const discardRun = createContract()
  .auth
  .route({
    path: "/runs/{runId}/actions/discard",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(DiscardRunInput)
  .output(DiscardRunOutput);

export const cancelRun = createContract()
  .auth
  .route({
    path: "/runs/{runId}/actions/cancel",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CancelRunInput)
  .output(CancelRunOutput);

export const forceCancelRun = createContract()
  .auth
  .route({
    path: "/runs/{runId}/actions/force-cancel",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ForceCancelRunInput)
  .output(ForceCancelRunOutput);

// --- Contract Router ---

export const runContract = {
  create: createRun,
  get: getRun,
  list: listRuns,
  actions: {
    apply: applyRun,
    discard: discardRun,
    cancel: cancelRun,
    forceCancel: forceCancelRun,
  },
};
