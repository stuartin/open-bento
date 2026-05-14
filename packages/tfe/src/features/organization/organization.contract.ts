import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  GetOrganizationEntitlementsInput,
  GetOrganizationEntitlementsOutput,
  ListOrganizationRunQueueInput,
  ListOrganizationRunQueueOutput,
} from "./organization.schema";

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
      body: GetOrganizationEntitlementsOutput,
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
      body: ListOrganizationRunQueueOutput,
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
