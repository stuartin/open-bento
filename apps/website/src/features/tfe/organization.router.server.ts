import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { GetOrganizationEntitlementsOutput, ListOrganizationRunQueueOutput, RESOURCE, tfeContract } from "@open-bento/tfe";
import { db } from "$features/db";

const os = createRouter(tfeContract.organizations).use(useAuth);
export const tfeOrganizationsRouter = os
    .router({
        entitlements: {
            get: os.entitlements.get.handler(async ({ errors, input }) => {

                const organization = await db.query.organizations.findFirst({
                    where: {
                        slug: input.params.organization
                    },
                    with: {
                        entitlementSet: true
                    }
                })

                if (!organization) throw errors.NOT_FOUND()

                const entitlementSet = GetOrganizationEntitlementsOutput.shape.body.safeParse({
                    data: {
                        type: RESOURCE.ENTITLEMENT_SETS,
                        id: organization.entitlementSet.id,
                        attributes: {
                            operations: organization.entitlementSet.operations
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
