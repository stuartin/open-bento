import { contract } from "@open-bento/types";
import { createRouter } from "../../lib/orpc";
import { useAuth } from "../../middleware/use-auth";
import { db } from "$lib/server/db";

const os = createRouter(contract.tfe.organizations);
export const tfeOrganizationsRouter = os
    .router({
        entitlementSet: os.entitlementSet
            .use(useAuth)
            .handler(
                async ({ input, path, context, errors }) => {

                    const organization = await db.query.organizations.findFirst({
                        where: {
                            AND: [
                                { slug: input.organization },
                                { members: { userId: context.user.id } }
                            ]
                        }
                    })

                    if (!organization) throw errors.NOT_FOUND()

                    context.resHeaders?.set("TFP-API-Version", "2.6")
                    return {
                        data: {
                            id: organization.id,
                            type: "entitlement-sets",
                            attributes: {
                                agents: true,
                                "audit-logging": true,
                                "configuration-designer": true,
                                "cost-estimation": true,
                                "global-run-tasks": true,
                                "module-tests-generation": true,
                                operations: true,
                                "policy-enforcement": true,
                                "policy-limit": 10,
                                "policy-mandatory-enforcement-limit": 10,
                                "policy-set-limit": 10,
                                "private-module-registry": true,
                                "private-policy-agents": true,
                                "private-run-tasks": true,
                                "private-vcs": true,
                                "run-task-limit": 10,
                                "run-task-mandatory-enforcement-limit": 10,
                                "run-task-workspace-limit": 10,
                                "run-tasks": true,
                                "self-serve-billing": true,
                                sentinel: true,
                                sso: true,
                                "state-storage": true,
                                teams: true,
                                "usage-reporting": true,
                                "user-limit": 10,
                                "vcs-integrations": true,
                                "versioned-policy-set-limit": 10,
                            }
                        }
                    }
                })
    })
