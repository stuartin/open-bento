import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  AuthHeadersSchema,
  JsonApiDocument,
  JsonApiCollection,
} from "../../lib/common.schema";
import { RunAttributesSchema } from "./run.schema";

// --- Input Types ---

const CreateRunInput = z.object({
  headers: AuthHeadersSchema,
  body: z.object({
    data: z.object({
      type: z.literal("runs"),
      attributes: z.object({
        "auto-apply": z.boolean().default(false),
        refresh: z.boolean().default(true),
        "save-plan": z.boolean().default(false),
        message: z.string().optional(),
        variables: z
          .array(
            z.object({
              key: z.string(),
              value: z.string(),
            })
          )
          .optional(),
      }),
      relationships: z.object({
        "configuration-version": z.object({
          data: z.object({
            type: z.literal("configuration-versions"),
            id: z.string(),
          }),
        }),
        workspace: z
          .object({
            data: z.object({
              type: z.literal("workspaces"),
              id: z.string(),
            }),
          })
          .optional(),
      }),
    }),
  }),
});

const GetRunInput = z.object({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
});

const ListRunsInput = z.object({
  params: z.object({
    workspaceId: z.string().describe("Workspace ID"),
  }),
  query: z
    .object({
      "page[number]": z.number().int().min(1).optional(),
      "page[size]": z.number().int().min(1).max(100).optional(),
    })
    .optional(),
  headers: AuthHeadersSchema,
});

const RunActionInput = z.object({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
  body: z
    .object({
      comment: z.string().optional(),
    })
    .optional(),
});

// --- Output Types ---

const RunOutputSchema = JsonApiDocument("runs", RunAttributesSchema);
const RunsOutputSchema = JsonApiCollection("runs", RunAttributesSchema);

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
      body: RunOutputSchema,
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
      body: RunOutputSchema,
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
      body: RunsOutputSchema,
    })
  );

export const applyRun = oc
  .route({
    path: "/api/v2/runs/{runId}/actions/apply",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(RunActionInput)
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
  .input(RunActionInput)
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
  .input(RunActionInput)
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
  .input(RunActionInput)
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
