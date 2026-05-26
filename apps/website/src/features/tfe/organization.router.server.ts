import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { ListOrganizationRunQueueOutput, RESOURCE, tfeContract, toKebab } from "@open-bento/tfe";
import { db } from "$features/db";

const os = createRouter(tfeContract.organizations).use(useAuth);
export const tfeOrganizationsRouter = os
    .router({
        entitlements: {
            get: os.entitlements.get.handler(async ({ errors, input, context }) => {

                const organization = await db.query.organizations.findFirst({
                    where: {
                        slug: input.params.organization
                    },
                    with: {
                        entitlementSet: true
                    }
                })

                if (!organization) throw errors.NOT_FOUND()
                if (!context.user.organizationIds.includes(organization.id)) throw errors.UNAUTHORIZED()

                return {
                    status: 200,
                    body: {
                        data: {
                            type: RESOURCE.ENTITLEMENT_SETS,
                            id: organization.entitlementSet.id,
                            attributes: toKebab(organization.entitlementSet)
                        }
                    }
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
