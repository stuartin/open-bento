import { oc } from "@orpc/contract";
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

// --- Contracts ---

export const createRun = oc
  .route({
    path: "/api/v2/runs",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CreateRunInput)
  .output(CreateRunOutput);

export const getRun = oc
  .route({
    path: "/api/v2/runs/{runId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetRunInput)
  .output(GetRunOutput);

export const listRuns = oc
  .route({
    path: "/api/v2/workspaces/{workspaceId}/runs",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListRunsInput)
  .output(ListRunsOutput);

export const applyRun = oc
  .route({
    path: "/api/v2/runs/{runId}/actions/apply",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ApplyRunInput)
  .output(ApplyRunOutput);

export const discardRun = oc
  .route({
    path: "/api/v2/runs/{runId}/actions/discard",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(DiscardRunInput)
  .output(DiscardRunOutput);

export const cancelRun = oc
  .route({
    path: "/api/v2/runs/{runId}/actions/cancel",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CancelRunInput)
  .output(CancelRunOutput);

export const forceCancelRun = oc
  .route({
    path: "/api/v2/runs/{runId}/actions/force-cancel",
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
