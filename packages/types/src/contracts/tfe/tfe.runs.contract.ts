import z from 'zod';
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../../lib/errors'
import { createContract } from '../../lib/orpc.contract'
import { tfeEntitySchema } from '../../lib/tfe';
import type { InferContractRouterOutputs } from "@orpc/contract"

type T = InferContractRouterOutputs<typeof tfeRunsContract>

const RunActionsSchema = z.object({
    "is-cancelable": z.boolean(),
    "is-confirmable": z.boolean(),
    "is-discardable": z.boolean(),
    "is-force-cancelable": z.boolean(),
});

const RunPermissionsSchema = z.object({
    "can-apply": z.boolean(),
    "can-cancel": z.boolean(),
    "can-comment": z.boolean(),
    "can-discard": z.boolean(),
    "can-force-execute": z.boolean(),
    "can-force-cancel": z.boolean(),
    "can-override-policy-check": z.boolean(),
});

const RunStatusSchema = z.literal([
    "pending",
    "fetching",
    "fetching_completed",
    "pre_plan_running",
    "pre_plan_completed",
    "queuing",
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
    "pre_apply_running",
    "pre_apply_completed",
    "apply_queued",
    "applying",
    "applied",
    "discarded",
    "errored",
    "canceled",
    "force_canceled",
    "planned_and_finished",
    "planned_and_saved",
]);

const RunVariableSchema = z.object({
    key: z.string(),
    value: z.string(),
});

export const TFERunAttributesSchema = z.object({
    // "actions": RunActionsSchema,
    // "canceled-at": z.string().nullable(),
    "created-at": z.iso.datetime(),
    // "has-changes": z.boolean(),
    // "auto-apply": z.boolean(),
    // "allow-empty-apply": z.boolean(),
    // "allow-config-generation": z.boolean(),
    // "is-destroy": z.boolean(),
    // "message": z.string().nullable(),
    // "plan-only": z.boolean(),
    // "source": z.string(),
    // "status-timestamps": z.record(z.string(), z.string()),
    "status": RunStatusSchema,
    // "trigger-reason": z.string(),
    // "target-addrs": z.array(z.string()).nullable(),
    // "permissions": RunPermissionsSchema,
    // "refresh": z.boolean(),
    // "refresh-only": z.boolean(),
    // "replace-addrs": z.array(z.string()).nullable(),
    // "save-plan": z.boolean(),
    // "variables": z.array(RunVariableSchema),
})

export const TFERunEventAttributesSchema = z.object({
    action: z.string(),
    "created-at": z.iso.datetime(),
    description: z.string()
})


export const TFERunTaskStageAttributesSchema = z.object({
    status: z.literal(["pending", "running", "passed", "failed", "errored", "canceled", "unreachable"]),
    stage: z.literal(["pre_plan", "post_plan", "pre_apply", "post_apply"]),
    "status-timestamps": z.object({
        "pending-at": z.iso.datetime().optional(),
        "running-at": z.iso.datetime().optional(),
        "passed-at": z.iso.datetime().optional(),
        "failed-at": z.iso.datetime().optional(),
        "canceled-at": z.iso.datetime().optional(),
    }),
    "created-at": z.iso.datetime(),
    "updated-at": z.iso.datetime()
})


const Tags = ['tfe']
const oc = createContract()
export const tfeRunsContract = oc.auth
    .prefix("/tfe")
    .router({
        get: oc.auth
            .route({
                tags: Tags,
                method: "GET",
                path: "/runs/{run}",
                inputStructure: "detailed"
            })
            .input(
                z.object({
                    params: z.object({
                        run: z.string()
                    }),
                    query: z.object({
                        include: z.union([z.literal("task_stages")]).optional()
                    })
                })
            )
            .output(
                tfeEntitySchema(
                    "runs",
                    TFERunAttributesSchema,
                ).or(
                    tfeEntitySchema(
                        "runs",
                        TFERunAttributesSchema,
                        {
                            includedSchema: z.object({
                                id: z.string(),
                                type: z.literal("task-stages"),
                                attributes: TFERunTaskStageAttributesSchema
                            }).array()
                        }
                    )
                )
            ),
        create: oc.auth
            .route({
                method: "POST",
                path: "/runs",
                tags: Tags,
            })
            .input(
                z.object({
                    data: z.object({
                        type: z.literal("runs"),
                        attributes: z.object({
                            "auto-apply": z.boolean(),
                            refresh: z.boolean(),
                            "save-plan": z.boolean(),
                            variables: z.object({
                                key: z.string(),
                                value: z.string()
                            }).array()
                        }),
                        relationships: z.object({
                            workspace: z.object({
                                data: z.object({
                                    type: z.literal("workspaces"),
                                    id: z.string()
                                })
                            }),
                            "configuration-version": z.object({
                                data: z.object({
                                    type: z.literal("configuration-versions"),
                                    id: z.string()
                                })
                            })
                        })
                    })
                })
            )
            .output(
                tfeEntitySchema(
                    "runs",
                    TFERunAttributesSchema
                )
            )
            .errors({
                NOT_FOUND
            }),
        events: oc.auth
            .prefix("/runs/{run}")
            .router({
                get: oc.auth
                    .route({
                        method: "GET",
                        path: "/run-events",
                        tags: Tags,
                    })
                    .input(
                        z.object({
                            run: z.string(),
                        })
                    )
                    .output(
                        tfeEntitySchema(
                            "run-events",
                            TFERunEventAttributesSchema,
                            { type: "list" }
                        )
                    )
            })

    })
