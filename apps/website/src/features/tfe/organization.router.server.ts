import { createRouter } from "$lib/server/api/lib/orpc";
import { useAuth } from "$lib/server/api/middleware/use-auth";
import { EntitlementSetAttributesSchema, JsonApiCollection, JsonApiDocument, RunQueueItemAttributesSchema, tfeContract } from "@open-bento/tfe";

const os = createRouter(tfeContract.organizations).use(useAuth);
export const tfeOrganizationsRouter = os
    .router({
        entitlements: {
            get: os.entitlements.get.handler(async ({ errors }) => {

                const entitlementSet = JsonApiDocument(
                    "entitlement-sets",
                    EntitlementSetAttributesSchema
                ).safeParse({
                    data: {
                        type: "entitlement-sets",
                        id: "id-entitlement-sets",
                        attributes: {
                            operations: true
                        }
                    }
                })

                if (!entitlementSet.success) throw errors.BAD_REQUEST(entitlementSet.error)

                return {
                    status: 200,
                    body: entitlementSet.data
                }
            })
        },
        runQueue: {
            list: os.runQueue.list.handler(async ({ errors }) => {

                const runQueue = JsonApiCollection(
                    "runs",
                    RunQueueItemAttributesSchema
                ).safeParse({
                    data: [{
                        type: "runs",
                        id: "id-runs",
                        attributes: {
                            status: "pending",
                        }
                    }]
                })

                if (!runQueue.success) throw errors.BAD_REQUEST(runQueue.error)

                return {
                    status: 200,
                    body: runQueue.data
                }
            })
        }
    })
