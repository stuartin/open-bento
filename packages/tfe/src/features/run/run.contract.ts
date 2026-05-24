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
    path: "/runs/{run}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetRunInput)
  .output(GetRunOutput);

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
    path: "/runs/{run}/run-events",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetRunEventsInput)
  .output(GetRunEventsOutput)

export const applyRun = createContract()
  .auth
  .route({
    path: "/runs/{run}/actions/apply",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ApplyRunInput)
  .output(ApplyRunOutput);

export const discardRun = createContract()
  .auth
  .route({
    path: "/runs/{run}/actions/discard",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(DiscardRunInput)
  .output(DiscardRunOutput);

export const cancelRun = createContract()
  .auth
  .route({
    path: "/runs/{run}/actions/cancel",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CancelRunInput)
  .output(CancelRunOutput);

export const forceCancelRun = createContract()
  .auth
  .route({
    path: "/runs/{run}/actions/force-cancel",
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
