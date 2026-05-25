import { createContract } from "../../lib/contract";
import { NOT_FOUND } from "../../lib/errors";
import {
  GetOrganizationEntitlementsInput,
  GetOrganizationEntitlementsOutput,
  ListOrganizationRunQueueInput,
  ListOrganizationRunQueueOutput,
} from "./organization.schema";

// --- Contracts ---

export const getOrganizationEntitlements = createContract()
  .auth
  .route({
    path: "/organizations/{organization}/entitlement-set",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetOrganizationEntitlementsInput)
  .output(GetOrganizationEntitlementsOutput)
  .errors({ NOT_FOUND })

export const listOrganizationRunQueue = createContract()
  .auth
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
