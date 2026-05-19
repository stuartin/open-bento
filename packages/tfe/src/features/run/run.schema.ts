import { z } from "zod";
import { AuthHeadersSchema, JsonApiCollection, JsonApiDocument, ORPCInput, ORPCOutput } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Run
// ============================================================

export const RunAttributesSchema = z.object({
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
    "post_plan_running",
    "post_plan_completed",
    "planned_and_finished",
    "apply_queued",
    "applying",
    "applied",
    "discarded",
    "errored",
    "canceled",
    "force_canceled",
  ]),
  "has-changes": z.boolean(),
  "is-destroy": z.boolean().optional(),
  message: z.string().nullable().optional(),
  "created-at": z.string().optional(),
  "position-in-queue": z.number().optional(),
  actions: z.object({
    "is-cancelable": z.boolean(),
    "is-confirmable": z.boolean(),
    "is-discardable": z.boolean(),
    "is-force-cancelable": z.boolean().optional(),
  }),
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Create Run ---

export const CreateRunInput = ORPCInput({
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

export const CreateRunOutput = ORPCOutput({
  status: z.literal(201),
  body: JsonApiDocument(
    "runs",
    RunAttributesSchema
  ),
});

// --- Get Run ---

export const GetRunInput = ORPCInput({
  params: z.object({
    runId: z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetRunOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    "runs",
    RunAttributesSchema
  ),
});

// --- List Runs ---

export const ListRunsInput = ORPCInput({
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

export const ListRunsOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiCollection(
    "runs",
    RunAttributesSchema
  ),
});

// --- Apply Run ---

export const ApplyRunInput = ORPCInput({
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

export const ApplyRunOutput = ORPCOutput({
  status: z.literal(202),
  body: z.undefined(),
});

// --- Discard Run ---

export const DiscardRunInput = ORPCInput({
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

export const DiscardRunOutput = ORPCOutput({
  status: z.literal(202),
  body: z.undefined(),
});

// --- Cancel Run ---

export const CancelRunInput = ORPCInput({
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

export const CancelRunOutput = ORPCOutput({
  status: z.literal(202),
  body: z.undefined(),
});

// --- Force Cancel Run ---

export const ForceCancelRunInput = ORPCInput({
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

export const ForceCancelRunOutput = ORPCOutput({
  status: z.literal(202),
  body: z.undefined(),
});
