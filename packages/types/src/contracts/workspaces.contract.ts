import z from 'zod'
import { IdSchema, ListSchema } from '../lib/shared'
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../lib/errors'
import { createContract } from '../lib/orpc.contract'
import { JobSchema } from './jobs.contract'

export const WorkspaceSchema = z.object({
    id: IdSchema.meta({ description: 'The workspace id' }),
    organizationId: IdSchema.meta({ description: 'The organization id' }),
    projectId: IdSchema.meta({ description: 'The project id' }),
    name: z.string().meta({ description: 'The workspace name' }),
    jobs: JobSchema.array().meta({ description: 'A list of jobs ran in the workspace' }),
    createdAt: z.date().meta({ description: 'The workspace creation date' }),
    updatedAt: z.date().meta({ description: 'The workspace last update date' }),
}).meta({
    description: 'A workspace',
    examples: [{
        id: 'workspace123',
        organizationId: 'org456xyz',
        projectId: 'proj789abc',
        name: 'my-workspace',
        jobs: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
    }]
})

const Tags = ["workspaces"]
const oc = createContract()
export const workspacesContract = oc.pub
    .prefix("/organizations/{organizationId}/projects/{projectId}")
    .router({
        get: oc.pub
            .route({
                method: "GET",
                path: "/workspaces/{workspaceId}",
                description: 'Get a workspace in a project',
                successDescription: 'The requested workspace',
                tags: Tags,
            })
            .input(
                WorkspaceSchema.pick({ organizationId: true, projectId: true }).extend({
                    workspaceId: WorkspaceSchema.shape.id,
                })
            )
            .output(
                WorkspaceSchema
            )
            .errors({
                NOT_FOUND
            }),
        list: oc.pub
            .route({
                method: "GET",
                path: "/workspaces",
                description: 'Get a list of workspaces in a project',
                successDescription: 'A list of workspaces',
                tags: Tags,
            })
            .input(
                WorkspaceSchema.pick({ organizationId: true, projectId: true })
            )
            .output(
                ListSchema(WorkspaceSchema)
            ),
        create: oc.auth
            .route({
                method: "POST",
                path: "/workspaces",
                description: 'Create a workspace in a project',
                successDescription: 'The new workspace',
                tags: Tags,
            })
            .input(
                WorkspaceSchema.pick({ organizationId: true, projectId: true, name: true })
            )
            .output(
                WorkspaceSchema
            )
            .errors({
                FORBIDDEN,
                CONFLICT
            }),
        update: oc.auth
            .route({
                method: "PATCH",
                path: "/workspaces/{workspaceId}",
                description: 'Update a workspace in a project',
                successDescription: 'The updated workspace',
                tags: Tags,
            })
            .input(
                WorkspaceSchema.pick({ name: true }).partial().extend({
                    organizationId: WorkspaceSchema.shape.organizationId,
                    projectId: WorkspaceSchema.shape.projectId,
                    workspaceId: WorkspaceSchema.shape.id,
                })
            )
            .output(
                WorkspaceSchema
            )
            .errors({
                NOT_FOUND,
                FORBIDDEN,
            }),
        delete: oc.auth
            .route({
                method: "DELETE",
                path: "/workspaces/{workspaceId}",
                description: 'Delete a workspace in a project',
                successDescription: 'Workspace deleted',
                successStatus: 204,
                tags: Tags,
            })
            .input(
                z.object({
                    organizationId: WorkspaceSchema.shape.organizationId,
                    projectId: WorkspaceSchema.shape.projectId,
                    workspaceId: WorkspaceSchema.shape.id,
                    force: z.boolean().optional()
                })
            )
            .output(
                z.undefined()
            )
            .errors({
                NOT_FOUND,
                FORBIDDEN,
                CONFLICT
            }),
    })
