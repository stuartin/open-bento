import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { GetRunEventsOutput, ListRunsOutput, RESOURCE, tfeContract, toCamel, toKebab } from "@open-bento/tfe";
import { createId } from "@paralleldrive/cuid2";
import { db } from "$features/db";
import { plans, runs } from "$features/db/schema";
import { env } from "$features/env/env.public";

const os = createRouter(tfeContract.runs).use(useAuth);
export const tfeRunsRouter = os
    .router({
        create: os.create.handler(async ({ input, errors, context }) => {
            if (!context.session.activeOrganizationId) throw errors.UNAUTHORIZED()

            const organizationId = context.session.activeOrganizationId
            const workspaceId = input.body.data.relationships.workspace.data.id
            const configurationVersionId = input.body.data.relationships["configuration-version"].data.id

            const { run } = await db.transaction(async (tx) => {

                const run = await tx
                    .insert(runs)
                    .values({
                        organizationId,
                        workspaceId,
                        configurationVersionId,
                        status: "plan_queued",
                        ...toCamel(input.body.data.attributes)
                    })
                    .returning()
                    .get()

                const plan = await tx
                    .insert(plans)
                    .values({
                        organizationId,
                        workspaceId,
                        runId: run.id,
                        logReadUrl: `${env.ORIGIN}${env.API_PREFIX}/tfe/read-logs/${run.id}/plan`
                    })
                    .returning()
                    .get()

                // if !run["plan-only"] create apply

                return { run, plan }
            })

            return {
                status: 201,
                body: {
                    data: {
                        type: RESOURCE.RUNS,
                        id: run.id,
                        attributes: toKebab(run)
                    }
                },
            };
        }),

        get: os.get.handler(async ({ input, errors }) => {

            const run = await db.query.runs.findFirst({
                where: {
                    id: input.params["run-id"]
                },
                with: {
                    plan: { columns: { id: true } },
                    workspace: { columns: { id: true } }
                }
            })

            if (!run) throw errors.NOT_FOUND()

            return {
                status: 200,
                body: {
                    data: {
                        type: RESOURCE.RUNS,
                        id: run.id,
                        attributes: toKebab({ ...run }),
                        relationships: {
                            plan: {
                                data: {
                                    type: RESOURCE.PLANS,
                                    id: run.plan.id
                                }
                            },
                            workspace: {
                                data: {
                                    type: RESOURCE.WORKSPACES,
                                    id: run.workspace.id
                                }
                            },
                        }
                    }
                },
            };
        }),

        list: os.list.handler(async ({ errors }) => {
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
                // TODO
                // Dont know what this endpoint does?
                // possibly legacy?
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
            apply: os.actions.apply.handler(async () => {
                return {
                    status: 202,
                    body: undefined,
                };
            }),

            discard: os.actions.discard.handler(async () => {
                return {
                    status: 202,
                    body: undefined,
                };
            }),

            cancel: os.actions.cancel.handler(async () => {
                return {
                    status: 202,
                    body: undefined,
                };
            }),

            forceCancel: os.actions.forceCancel.handler(async () => {
                return {
                    status: 202,
                    body: undefined,
                };
            }),
        }),
    })
