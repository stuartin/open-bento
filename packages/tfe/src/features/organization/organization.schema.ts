import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// --- Get Organization Entitlements ---

export const GetOrganizationEntitlementsInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
  }),
  headers: AuthHeadersSchema,
});

export const EntitlementSetAttributesSchema = z.object({
  operations: z.boolean(),
});

export type EntitlementSet = z.infer<typeof EntitlementSetAttributesSchema> & {
  id: string;
};

export const GetOrganizationEntitlementsOutput = z.object({
  data: z.object({
    type: z.literal("entitlement-sets"),
    id: z.string(),
    attributes: EntitlementSetAttributesSchema,
  }),
});

export const serializeGetOrganizationEntitlementsOutput: EntitySerializer<EntitlementSet> = {
  getId: (entitlementSet) => entitlementSet.id,
  serialize: (entitlementSet) => ({
    attributes: {
      operations: entitlementSet.operations,
    },
  }),
};

export const deserializeGetOrganizationEntitlementsOutput = createDeserializer({
  type: "entitlement-sets",
  cardinality: "one",
  attributesSchema: EntitlementSetAttributesSchema,
});

// --- List Organization Run Queue ---

export const ListOrganizationRunQueueInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
  }),
  headers: AuthHeadersSchema,
});

export const RunQueueItemAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "plan_queued",
    "planning",
    "planned",
    "cost_estimating",
    "cost_estimated",
    "policy_checking",
    "policy_override",
    "policy_soft_failed",
    "policy_checked",
    "confirmed",
    "planned_and_finished",
    "apply_queued",
    "applying",
    "applied",
    "discarded",
    "errored",
    "canceled",
    "force_canceled",
  ]),
  "position-in-queue": z.number().optional(),
});

export type RunQueueItem = z.infer<typeof RunQueueItemAttributesSchema> & {
  id: string;
};

export const ListOrganizationRunQueueOutput = z.object({
  data: z.array(
    z.object({
      type: z.literal("runs"),
      id: z.string(),
      attributes: RunQueueItemAttributesSchema,
    })
  ),
});

export const serializeListOrganizationRunQueueOutput: EntitySerializer<RunQueueItem> = {
  getId: (item) => item.id,
  serialize: (item) => ({
    attributes: {
      status: item.status,
      "position-in-queue": item["position-in-queue"],
    },
  }),
};

export const deserializeListOrganizationRunQueueOutput = createDeserializer({
  type: "runs",
  cardinality: "many",
  attributesSchema: RunQueueItemAttributesSchema,
});
