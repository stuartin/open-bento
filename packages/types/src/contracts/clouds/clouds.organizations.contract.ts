import z from 'zod';
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../../lib/errors'
import { createContract } from '../../lib/orpc.contract'

export const EntitlementSetSchema = z.object({
    data: z.object({
        id: z.string(),
        type: z.literal("entitlement-sets"),
        attributes: z.object({
            agents: z.boolean(),
            "audit-logging": z.boolean(),
            "configuration-designer": z.boolean(),
            "cost-estimation": z.boolean(),
            "global-run-tasks": z.boolean(),
            "module-tests-generation": z.boolean(),
            operations: z.boolean(),
            "policy-enforcement": z.boolean(),
            "policy-limit": z.number(),
            "policy-mandatory-enforcement-limit": z.number().nullable(),
            "policy-set-limit": z.number(),
            "private-module-registry": z.boolean(),
            "private-policy-agents": z.boolean(),
            "private-run-tasks": z.boolean(),
            "private-vcs": z.boolean(),
            "run-task-limit": z.number(),
            "run-task-mandatory-enforcement-limit": z.number(),
            "run-task-workspace-limit": z.number(),
            "run-tasks": z.boolean(),
            "self-serve-billing": z.boolean(),
            sentinel: z.boolean(),
            sso: z.boolean(),
            "state-storage": z.boolean(),
            teams: z.boolean(),
            "usage-reporting": z.boolean(),
            "user-limit": z.number(),
            "vcs-integrations": z.boolean(),
            "versioned-policy-set-limit": z.number().nullable(),
        }),
    }),
});

const Tags = ['Cloud']
const oc = createContract()
export const cloudsOrganizationsContract = oc.auth
    .prefix("/cloud/v2")
    .router({
        entitlementSet: oc.auth
            .route({
                method: "GET",
                path: "/organizations/{organization}/entitlement-set",
                tags: Tags
            })
            .input(
                z.object({
                    organization: z.string(),
                })
            )
            .errors({
                NOT_FOUND
            }),
    })
