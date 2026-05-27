import { z } from "zod";
import { AuthHeadersSchema, JsonApiCollection, JsonApiDocument, ORPCInput, ORPCOutput, RESOURCE } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Entitlement Set
// ============================================================

export const EntitlementSetAttributesSchema = z.object({
  operations: z.boolean(),
});

// ============================================================
// ENTITY DEFINITION - Run Queue Item
// ============================================================

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

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Organization Entitlements ---

export const GetOrganizationEntitlementsInput = ORPCInput({
  params: z.object({
    organization: z.string().describe("Organization name"),
  }),
  headers: AuthHeadersSchema,
});

export const GetOrganizationEntitlementsOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    RESOURCE.ENTITLEMENT_SETS,
    EntitlementSetAttributesSchema
  )
});

// --- List Organization Run Queue ---

export const ListOrganizationRunQueueInput = ORPCInput({
  params: z.object({
    organization: z.string().describe("Organization name"),
  }),
  headers: AuthHeadersSchema,
});

export const ListOrganizationRunQueueOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiCollection(
    RESOURCE.RUNS,
    RunQueueItemAttributesSchema
  ),
});

// ============================================================
// Type
// ============================================================

export type EntitlementSet = z.infer<ReturnType<typeof JsonApiDocument<typeof RESOURCE.ENTITLEMENT_SETS, typeof EntitlementSetAttributesSchema>>>
export type RunQueueItem = z.infer<ReturnType<typeof JsonApiDocument<typeof RESOURCE.RUNS, typeof RunQueueItemAttributesSchema>>>
