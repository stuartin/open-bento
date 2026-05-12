import { z } from "zod";
import { oc } from "@orpc/contract";
import { AuthHeadersSchema, JsonApiDocument } from "../../lib/common.schema";
import { OrganizationAttributesSchema } from "./organization.schema";
import { RunAttributesSchema } from "../run/run.schema";

// --- Input Types ---

const GetOrganizationEntitlementsInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
  }),
  headers: AuthHeadersSchema,
});

const ListOrganizationRunQueueInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---

const OrganizationEntitlementsOutputSchema = z.object({
  data: z.object({
    type: z.literal("entitlement-sets"),
    id: z.string(),
    attributes: z.object({
      operations: z.boolean(),
    }),
  }),
});

const OrganizationRunQueueOutputSchema = z.object({
  data: z.array(
    z.object({
      type: z.literal("runs"),
      id: z.string(),
      attributes: z.object({
        status: RunAttributesSchema.shape.status,
        "position-in-queue": z.number().optional(),
      }),
    })
  ),
});

// --- Contracts ---

export const getOrganizationEntitlements = oc
  .route({
    path: "/api/v2/organizations/{organization}/entitlement-set",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetOrganizationEntitlementsInput)
  .output(
    z.object({
      status: z.literal(200),
      body: OrganizationEntitlementsOutputSchema,
    })
  );

export const listOrganizationRunQueue = oc
  .route({
    path: "/api/v2/organizations/{organization}/runs/queue",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListOrganizationRunQueueInput)
  .output(
    z.object({
      status: z.literal(200),
      body: OrganizationRunQueueOutputSchema,
    })
  );

// --- Contract Router ---

export const organizationContract = {
  entitlements: {
    get: getOrganizationEntitlements,
  },
  runQueue: {
    list: listOrganizationRunQueue,
  },
};
