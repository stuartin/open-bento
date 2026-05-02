import z from 'zod';
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../../lib/errors'
import { createContract } from '../../lib/orpc.contract'
import { tfeEntitySchema } from '../../lib/tfe';

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

const RunStatusSchema = z.enum([
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

export const TFERunSchema = tfeEntitySchema(
    "runs",
    z.object({
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
);


const Tags = ['tfe']
const oc = createContract()
export const tfeRunsContract = oc.auth
    .prefix("/tfe")
    .router({
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
                TFERunSchema
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
                        // https://github.com/hashicorp/go-tfe/blob/main/run_event.go
                        // not documented?
                        z.object({
                            id: z.string(),
                            action: z.string(),
                            "created-at": z.iso.ZodISODateTime,
                            description: z.string()
                        })
                    )
            })

    })
