import { createRouter } from "$lib/server/api/lib/orpc";
import { useAuth } from "$lib/server/api/middleware/use-auth";
import { EntitlementSetAttributesSchema, JsonApiCollection, JsonApiDocument, RunQueueItemAttributesSchema, tfeContract } from "@open-bento/tfe";
import { ORPCError } from "@orpc/client";

const os = createRouter(tfeContract.organizations).use(useAuth);
export const tfeOrganizationsRouter = os
    .router({
        entitlements: {
            get: os.entitlements.get.handler(async ({ input }) => {

                const entitlementSet = JsonApiDocument(
                    "entitlement-sets",
                    EntitlementSetAttributesSchema
                ).safeParse({

                })

                if (!entitlementSet.success) throw new ORPCError("NOT_FOUND")

                return {
                    status: 200,
                    body: entitlementSet.data
                }
            })
        },
        runQueue: {
            list: os.runQueue.list.handler(async () => {

                const runQueue = JsonApiCollection(
                    "runs",
                    RunQueueItemAttributesSchema
                ).safeParse({

                })

                if (!runQueue.success) throw new ORPCError("NOT_FOUND")

                return {
                    status: 200,
                    body: runQueue.data
                }
            })
        }
    })
