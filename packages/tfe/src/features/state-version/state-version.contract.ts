import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  AuthHeadersSchema,
  JsonApiDocument,
  JsonApiCollection,
} from "../../lib/common.schema";
import { StateVersionAttributesSchema } from "./state-version.schema";

// --- Input Types ---

const GetCurrentStateVersionInput = z.object({
  params: z.object({
    workspaceId: z.string().describe("Workspace ID"),
  }),
  headers: AuthHeadersSchema,
});

const GetStateVersionInput = z.object({
  params: z.object({
    stateVersionId: z.string().describe("State Version ID"),
  }),
  headers: AuthHeadersSchema,
});

const ListStateVersionsInput = z.object({
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

// --- Output Types ---

const StateVersionOutputSchema = z.object({
  data: JsonApiDocument("state-versions", StateVersionAttributesSchema).shape
    .data.nullable(),
});
const StateVersionsOutputSchema = JsonApiCollection(
  "state-versions",
  StateVersionAttributesSchema
);

// --- Contracts ---

export const getCurrentStateVersion = oc
  .route({
    path: "/api/v2/workspaces/{workspaceId}/current-state-version",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetCurrentStateVersionInput)
  .output(
    z.object({
      status: z.literal(200),
      body: StateVersionOutputSchema,
    })
  );

export const getStateVersion = oc
  .route({
    path: "/api/v2/state-versions/{stateVersionId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetStateVersionInput)
  .output(
    z.object({
      status: z.literal(200),
      body: JsonApiDocument("state-versions", StateVersionAttributesSchema),
    })
  );

export const listStateVersions = oc
  .route({
    path: "/api/v2/workspaces/{workspaceId}/state-versions",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListStateVersionsInput)
  .output(
    z.object({
      status: z.literal(200),
      body: StateVersionsOutputSchema,
    })
  );

// --- Contract Router ---

export const stateVersionContract = {
  getCurrent: getCurrentStateVersion,
  get: getStateVersion,
  list: listStateVersions,
};
