import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  CreateRunInput,
  CreateRunOutput,
  GetRunInput,
  GetRunOutput,
  ListRunsInput,
  ListRunsOutput,
  ApplyRunInput,
  DiscardRunInput,
  CancelRunInput,
  ForceCancelRunInput,
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
  .output(
    z.object({
      status: z.literal(201),
      body: CreateRunOutput,
    })
  );

export const getRun = oc
  .route({
    path: "/api/v2/runs/{runId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetRunInput)
  .output(
    z.object({
      status: z.literal(200),
      body: GetRunOutput,
    })
  );

export const listRuns = oc
  .route({
    path: "/api/v2/workspaces/{workspaceId}/runs",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListRunsInput)
  .output(
    z.object({
      status: z.literal(200),
      body: ListRunsOutput,
    })
  );

export const applyRun = oc
  .route({
    path: "/api/v2/runs/{runId}/actions/apply",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ApplyRunInput)
  .output(
    z.object({
      status: z.literal(202),
      body: z.undefined(),
    })
  );

export const discardRun = oc
  .route({
    path: "/api/v2/runs/{runId}/actions/discard",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(DiscardRunInput)
  .output(
    z.object({
      status: z.literal(202),
      body: z.undefined(),
    })
  );

export const cancelRun = oc
  .route({
    path: "/api/v2/runs/{runId}/actions/cancel",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CancelRunInput)
  .output(
    z.object({
      status: z.literal(202),
      body: z.undefined(),
    })
  );

export const forceCancelRun = oc
  .route({
    path: "/api/v2/runs/{runId}/actions/force-cancel",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ForceCancelRunInput)
  .output(
    z.object({
      status: z.literal(202),
      body: z.undefined(),
    })
  );

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
