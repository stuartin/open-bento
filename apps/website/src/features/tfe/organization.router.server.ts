import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { GetOrganizationEntitlementsOutput, ListOrganizationRunQueueOutput, tfeContract } from "@open-bento/tfe";

const os = createRouter(tfeContract.organizations).use(useAuth);
export const tfeOrganizationsRouter = os
    .router({
        entitlements: {
            get: os.entitlements.get.handler(async ({ errors }) => {

                const entitlementSet = GetOrganizationEntitlementsOutput.shape.body.safeParse({
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

                const runQueue = ListOrganizationRunQueueOutput.shape.body.safeParse({
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
