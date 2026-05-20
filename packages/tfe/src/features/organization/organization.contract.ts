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
    path: "/organizations/{organization}/entitlement-set",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetOrganizationEntitlementsInput)
  .output(GetOrganizationEntitlementsOutput);

export const listOrganizationRunQueue = oc
  .route({
    path: "/organizations/{organization}/runs/queue",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListOrganizationRunQueueInput)
  .output(ListOrganizationRunQueueOutput);

// --- Contract Router ---

export const organizationContract = {
  entitlements: {
    get: getOrganizationEntitlements,
  },
  runQueue: {
    list: listOrganizationRunQueue,
  },
};
