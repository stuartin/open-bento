import z from 'zod';
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../../lib/errors'
import { createContract } from '../../lib/orpc.contract'
import { toEntityResponseSchema } from '../../lib/tfe';

const WorkspaceActionsSchema = z.object({
    "is-destroyable": z.boolean(),
})

const WorkspacePermissionsSchema = z.object({
    "can-update": z.boolean(),
    "can-destroy": z.boolean(),
    "can-queue-run": z.boolean(),
    "can-read-run": z.boolean(),
    "can-read-variable": z.boolean(),
    "can-update-variable": z.boolean(),
    "can-read-state-versions": z.boolean(),
    "can-read-state-outputs": z.boolean(),
    "can-create-state-versions": z.boolean(),
    "can-queue-apply": z.boolean(),
    "can-lock": z.boolean(),
    "can-unlock": z.boolean(),
    "can-force-unlock": z.boolean(),
    "can-read-settings": z.boolean(),
    "can-manage-tags": z.boolean(),
    "can-manage-run-tasks": z.boolean(),
    "can-force-delete": z.boolean(),
    "can-manage-assessments": z.boolean(),
    "can-manage-ephemeral-workspaces": z.boolean(),
    "can-read-assessment-results": z.boolean(),
    "can-queue-destroy": z.boolean(),
})

const WorkspaceSettingOverwritesSchema = z.object({
    "execution-mode": z.boolean().optional(),
    "agent-pool": z.boolean().optional(),
})

const WorkspaceSchema = z.object({
    // "actions": WorkspaceActionsSchema,
    // "allow-destroy-plan": z.boolean(),
    // "assessments-enabled": z.boolean(),
    // "auto-apply": z.boolean(),
    // "auto-apply-run-trigger": z.boolean(),
    // "auto-destroy-at": z.string().nullable(),
    // "auto-destroy-status": z.string().nullable(),
    // "auto-destroy-activity-duration": z.string().nullable(),
    // "inherits-project-auto-destroy": z.boolean().nullable(),
    "description": z.string().nullable(),
    // "environment": z.string(),
    "execution-mode": z.enum(["remote", "local", "agent"]),
    // "file-triggers-enabled": z.boolean(),
    // "global-remote-state": z.boolean(),
    // "latest-change-at": z.string(),
    // "last-assessment-result-at": z.string().nullable(),
    "locked": z.boolean(),
    "locked-reason": z.string().nullable(),
    "name": z.string(),
    // "oauth-client-name": z.string().nullable(),
    // "operations": z.boolean(),
    // "permissions": WorkspacePermissionsSchema,
    "permissions": z.object({
        "can-queue-run": z.boolean().default(true)
    }),
    // "apply-duration-average": z.number().nullable(),
    // "plan-duration-average": z.number().nullable(),
    // "policy-check-failures": z.number().nullable(),
    // "queue-all-runs": z.boolean(),
    // "resource-count": z.number(),
    // "run-failures": z.number().nullable(),
    // "source": z.string(),
    // "source-name": z.string().nullable(),
    // "source-url": z.string().nullable(),
    // "speculative-enabled": z.boolean(),
    // "structured-run-output-enabled": z.boolean(),
    // "tag-names": z.array(z.string()),
    "terraform-version": z.string(),
    // "trigger-prefixes": z.array(z.string()),
    "created-at": z.iso.datetime(),
    "updated-at": z.iso.datetime(),
    // "vcs-repo": z.unknown().nullable(),
    // "vcs-repo-identifier": z.string().nullable(),
    "working-directory": z.string().nullable(),
    // "workspace-kpis-runs-count": z.number(),
    // "setting-overwrites": WorkspaceSettingOverwritesSchema,
})

const StateVersionResourceSchema = z.object({
    "name": z.string(),
    "type": z.string(),
    "count": z.number(),
    "module": z.string(),
    "provider": z.string(),
})

const StateVersionSchema = z.object({
    // "billable-rum-count": z.number(),
    "created-at": z.iso.datetime(),
    // "size": z.number(),
    // "hosted-state-download-url": z.url(),
    // "hosted-state-upload-url": z.url().nullable(),
    // "hosted-json-state-download-url": z.url(),
    // "hosted-json-state-upload-url": z.url().nullable(),
    "status": z.enum(["pending", "finalized", "discarded"]),
    // "intermediate": z.boolean(),
    "modules": z.record(z.string(), z.record(z.string(), z.number())),
    "providers": z.record(z.string(), z.record(z.string(), z.number())),
    "resources": z.array(StateVersionResourceSchema),
    // "resources-processed": z.boolean(),
    "serial": z.number(),
    "state-version": z.number(),
    "terraform-version": z.string(),
    // "vcs-commit-url": z.url().nullable(),
    // "vcs-commit-sha": z.string().nullable(),
})

const Tags = ['tfe']
const oc = createContract()
export const tfeOrganizationsWorkspacesContract = oc.auth
    .prefix("/tfe/organizations/{organization}")
    .router({
        get: oc.auth
            .route({
                method: "GET",
                path: "/workspaces/{workspace}",
                tags: Tags,
            })
            .input(
                z.object({
                    organization: z.string(),
                    workspace: z.string(),
                })
            )
            .output(
                toEntityResponseSchema("workspaces", WorkspaceSchema)
            )
            .errors({
                NOT_FOUND
            }),
        create: oc.auth
            .route({
                method: "POST",
                path: "/workspaces",
                tags: Tags,
            })
            .input(
                z.object({
                    organization: z.string(),
                    data: z.object({
                        type: z.literal("workspaces"),
                        attributes: z.object({
                            name: z.string()
                        })
                    }),
                })
            )
            .output(
                toEntityResponseSchema("workspaces", WorkspaceSchema)
            )
            .errors({
                FORBIDDEN,
            }),
        update: oc.auth
            .route({
                method: "PATCH",
                path: "/workspaces",
                tags: Tags,
            })
            .input(
                z.object({
                    organization: z.string(),
                    data: z.object({
                        type: z.literal("workspaces"),
                        attributes: z.object({
                            name: z.string(),
                        })
                    }),
                })
            )
            .output(
                toEntityResponseSchema("workspaces", WorkspaceSchema)
            )
            .errors({
                FORBIDDEN,
            }),
        getCurrentStateVersion: oc.auth
            .route({
                method: "GET",
                path: "/workspaces/{workspace}/current-state-version",
                tags: Tags,
            })
            .input(
                z.object({
                    organization: z.string(),
                    workspace: z.string(),
                })
            )
            .output(
                toEntityResponseSchema("state-versions", StateVersionSchema)
            )
            .errors({
                NOT_FOUND
            }),
    })




const ConfigurationVersionSchema = z.object({
    "auto-queue-runs": z.boolean(),
    "error": z.string().nullable(),
    "error-message": z.string().nullable(),
    "source": z.string(),
    "speculative": z.boolean(),
    "status": z.enum(["pending", "fetching", "uploaded", "archiving", "archived", "errored"]),
    "status-timestamps": z.record(z.string(), z.string()).optional(),
    "upload-url": z.url(),
    "provisional": z.boolean(),
})

export const tfeWorkspacesContract = oc.auth
    .prefix("/tfe")
    .router({
        createConfigurationVersions: oc.auth
            .route({
                method: "POST",
                path: "/workspaces/{workspace}/configuration-versions",
                tags: Tags,
            })
            .input(
                z.object({
                    workspace: z.string(),
                    data: z.object({
                        type: z.literal('configuration-versions'),
                        attributes: z.object({
                            'auto-queue-runs': z.boolean(),
                            provisional: z.boolean(),
                            speculative: z.boolean()
                        })
                    })
                })
            )
            .output(
                toEntityResponseSchema("configuration-versions", ConfigurationVersionSchema)
            )
            .errors({
                NOT_FOUND
            }),

    })
