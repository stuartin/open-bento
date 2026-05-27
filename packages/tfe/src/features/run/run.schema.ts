import { z } from "zod";
import { AuthHeadersSchema, JsonApiCollection, JsonApiDocument, ORPCInput, ORPCOutput, RESOURCE } from "../../lib/common.schema";

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
  "auto-apply": z.boolean().describe("`true` when using -auto-approve"),
  refresh: z.boolean().describe("`false` when -refresh=false"),
  "is-destroy": z.boolean().describe("`true` during terraform destroy"),
  "plan-only": z.boolean().describe("`true` during terraform plan, `false` during terraform apply"),
  message: z.string().nullable().optional(),
  "position-in-queue": z.number(),
  actions: z.object({
    "is-cancelable": z.boolean(),
    "is-confirmable": z.boolean(),
    "is-discardable": z.boolean(),
    "is-force-cancelable": z.boolean(),
  }),
  permissions: z.object({
    "can-apply": z.boolean(),
    "can-cancel": z.boolean(),
    "can-comment": z.boolean(),
    "can-discard": z.boolean(),
    "can-force-execute": z.boolean(),
    "can-force-cancel": z.boolean(),
    "can-override-policy-check": z.boolean(),
  }),
  variables: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
  "created-at": z.coerce.date(),
  "updated-at": z.coerce.date(),
});

export const RunEventsSchema = z.object({
  action: z.string(),
  "created-at": z.iso.datetime(),
  description: z.string()
})

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Create Run ---

export const CreateRunInput = ORPCInput({
  headers: AuthHeadersSchema,
  body: z.object({
    data: z.object({
      type: z.literal(RESOURCE.RUNS),
      attributes: z.object({
        "auto-apply": z.boolean(),
        refresh: z.boolean(),
        "save-plan": z.boolean(),
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
            type: z.literal(RESOURCE.CONFIGURATION_VERSIONS),
            id: z.string(),
          }),
        }),
        workspace: z
          .object({
            data: z.object({
              type: z.literal(RESOURCE.WORKSPACES),
              id: z.string(),
            }),
          })
      }),
    }),
  }),
});

export const CreateRunOutput = ORPCOutput({
  status: z.literal(201),
  body: JsonApiDocument(
    RESOURCE.RUNS,
    RunAttributesSchema
  ),
});

// --- Get Run ---

export const GetRunInput = ORPCInput({
  params: z.object({
    "run-id": z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetRunOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    RESOURCE.RUNS,
    RunAttributesSchema,
    z.object({
      plan: z.object({
        data: z.object({
          type: z.literal(RESOURCE.PLANS),
          id: z.string(),
        })
      }),
      workspace: z.object({
        data: z.object({
          type: z.literal(RESOURCE.WORKSPACES),
          id: z.string(),
        })
      })
    })
  ),
});

// --- List Runs ---

export const ListRunsInput = ORPCInput({
  params: z.object({
    workspace: z.string().describe("Workspace ID"),
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
    RESOURCE.RUNS,
    RunAttributesSchema
  ),
});

// --- Get Run Events ---

export const GetRunEventsInput = ORPCInput({
  params: z.object({
    "run-id": z.string().describe("Run ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetRunEventsOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiCollection(
    RESOURCE.RUN_EVENTS,
    RunEventsSchema
  ),
});

// --- Apply Run ---

export const ApplyRunInput = ORPCInput({
  params: z.object({
    "run-id": z.string().describe("Run ID"),
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
    "run-id": z.string().describe("Run ID"),
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
    "run-id": z.string().describe("Run ID"),
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
    "run-id": z.string().describe("Run ID"),
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


// ============================================================
// Type
// ============================================================

export type Run = z.infer<ReturnType<typeof JsonApiDocument<typeof RESOURCE.RUNS, typeof RunAttributesSchema>>>
