import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { CreateRunOutput, GetRunEventsOutput, GetRunOutput, ListRunsOutput, tfeContract } from "@open-bento/tfe";
import { createId } from "@paralleldrive/cuid2";

const os = createRouter(tfeContract.runs).use(useAuth);
export const tfeRunsRouter = os
    .router({
        create: os.create.handler(async ({ input, errors }) => {
            const cuid2 = createId();
            const id = `run-${cuid2}`;

            const run = CreateRunOutput.shape.body.safeParse({
                data: {
                    type: "runs",
                    id,
                    attributes: {
                        status: "pending",
                        "has-changes": false,
                        "is-destroy": false,
                        "plan-only": true,
                        refresh: input.body.data.attributes.refresh,
                        "save-plan": input.body.data.attributes["save-plan"],
                        "auto-apply": input.body.data.attributes["auto-apply"],
                        message: input.body.data.attributes.message || null,
                        "created-at": new Date().toISOString(),
                        "position-in-queue": 0,
                        actions: {
                            "is-cancelable": true,
                            "is-confirmable": false,
                            "is-discardable": false,
                            "is-force-cancelable": false,
                        },
                        permissions: {
                            "can-apply": false,
                            "can-cancel": false,
                            "can-comment": false,
                            "can-discard": false,
                            "can-force-execute": false,
                            "can-force-cancel": false,
                            "can-override-policy-check": false,
                        },
                        variables: input.body.data.attributes.variables
                    },
                },
            });

            if (!run.success) throw errors.BAD_REQUEST(run.error);

            return {
                status: 201 as const,
                body: run.data,
            };
        }),

        get: os.get.handler(async ({ input, errors }) => {

            const run = GetRunOutput.shape.body.safeParse({
                data: {
                    type: "runs",
                    id: input.params.run,
                    attributes: {
                        status: "planned_and_finished",
                        "has-changes": false,
                        "is-destroy": false,
                        "plan-only": true,
                        refresh: false,
                        "save-plan": false,
                        "auto-apply": false,
                        message: null,
                        "created-at": new Date().toISOString(),
                        "position-in-queue": 0,
                        actions: {
                            "is-cancelable": true,
                            "is-confirmable": false,
                            "is-discardable": false,
                            "is-force-cancelable": false,
                        },
                        permissions: {
                            "can-apply": false,
                            "can-cancel": false,
                            "can-comment": false,
                            "can-discard": false,
                            "can-force-execute": false,
                            "can-force-cancel": false,
                            "can-override-policy-check": false,
                        },
                        variables: []
                    },
                    relationships: {
                        plan: {
                            data: {
                                type: "plans",
                                id: "plan-id",
                            }
                        },
                        workspace: {
                            data: {
                                type: "workspaces",
                                id: "workspace-id"
                            }
                        },
                    }
                },
            })

            if (!run.success) throw errors.BAD_REQUEST(run.error);

            return {
                status: 200,
                body: run.data,
            };
        }),

        list: os.list.handler(async ({ input, errors }) => {
            const runs = ListRunsOutput.shape.body.safeParse({
                data: [
                    {
                        type: "runs",
                        id: `run-${createId()}`,
                        attributes: {
                            status: "applied",
                            "has-changes": true,
                            "is-destroy": false,
                            message: "Applied successfully",
                            "created-at": new Date().toISOString(),
                            actions: {
                                "is-cancelable": false,
                                "is-confirmable": false,
                                "is-discardable": false,
                                "is-force-cancelable": false,
                            },
                        },
                    },
                ],
            });

            if (!runs.success) throw errors.BAD_REQUEST(runs.error);

            return {
                status: 200,
                body: runs.data,
            };
        }),

        events: os.events.router({
            get: os.events.get.handler(async ({ errors }) => {
                const runEvents = GetRunEventsOutput.shape.body.safeParse({
                    data: [
                        {
                            type: "run-events",
                            id: `id-run-events}`,
                            attributes: {
                                action: "",
                                "created-at": new Date().toISOString(),
                                description: ""
                            },
                        },
                    ],
                });

                if (!runEvents.success) throw errors.BAD_REQUEST(runEvents.error);

                return {
                    status: 200,
                    body: runEvents.data,
                };
            })
        }),

        actions: os.actions.router({
            apply: os.actions.apply.handler(async ({ input }) => {
                return {
                    status: 202,
                    body: undefined,
                };
            }),

            discard: os.actions.discard.handler(async ({ input }) => {
                return {
                    status: 202,
                    body: undefined,
                };
            }),

            cancel: os.actions.cancel.handler(async ({ input }) => {
                return {
                    status: 202,
                    body: undefined,
                };
            }),

            forceCancel: os.actions.forceCancel.handler(async ({ input }) => {
                return {
                    status: 202,
                    body: undefined,
                };
            }),
        }),
    })
