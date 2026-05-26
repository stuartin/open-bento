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
  GetRunEventsOutput,
  GetRunEventsInput,
} from "./run.schema";
import { createContract } from "../../lib/contract";
import { NOT_FOUND } from "../../lib/errors";

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
    path: "/runs/{run-id}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetRunInput)
  .output(GetRunOutput)
  .errors({ NOT_FOUND })

export const listRuns = createContract()
  .auth
  .route({
    path: "/workspaces/{workspace}/runs",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListRunsInput)
  .output(ListRunsOutput);

export const getRunEvents = createContract()
  .auth
  .route({
    path: "/runs/{run-id}/run-events",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetRunEventsInput)
  .output(GetRunEventsOutput)

export const applyRun = createContract()
  .auth
  .route({
    path: "/runs/{run-id}/actions/apply",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ApplyRunInput)
  .output(ApplyRunOutput);

export const discardRun = createContract()
  .auth
  .route({
    path: "/runs/{run-id}/actions/discard",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(DiscardRunInput)
  .output(DiscardRunOutput);

export const cancelRun = createContract()
  .auth
  .route({
    path: "/runs/{run-id}/actions/cancel",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CancelRunInput)
  .output(CancelRunOutput);

export const forceCancelRun = createContract()
  .auth
  .route({
    path: "/runs/{run-id}/actions/force-cancel",
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
  events: {
    get: getRunEvents
  },
  actions: {
    apply: applyRun,
    discard: discardRun,
    cancel: cancelRun,
    forceCancel: forceCancelRun,
  },
};
