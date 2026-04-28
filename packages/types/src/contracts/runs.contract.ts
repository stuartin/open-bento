import z from 'zod'
import { IdSchema, ListSchema } from '../lib/shared'
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../lib/errors'
import { createContract } from '../lib/orpc.contract'

export const RunTypeSchema = z.enum(['plan', 'apply'])
export const RunStatusSchema = z.enum(['pending', 'started', 'running', 'success', 'error'])
export const RunToolSchema = z.enum(['tofu', 'terraform'])

export const RunSchema = z.object({
    id: IdSchema.meta({ description: 'The run id' }),
    organizationId: IdSchema.meta({ description: 'The organization id' }),
    projectId: IdSchema.meta({ description: 'The project id' }),
    workspaceId: IdSchema.meta({ description: 'The workspace id' }),
    type: RunTypeSchema.meta({ description: 'The run type' }),
    tool: RunToolSchema.default("tofu").meta({ description: 'The IaC tool to use' }),
    toolVersion: z.string().default("1.9.1").meta({ description: 'The tool version' }),
    status: RunStatusSchema.meta({ description: 'The run status' }),
    logs: z.string().meta({ description: 'The run logs' }),
    createdAt: z.date().meta({ description: 'The run creation date' }),
    updatedAt: z.date().meta({ description: 'The run last update date' }),
}).meta({
    description: 'A run',
    examples: [{
        id: 'abc123def',
        organizationId: 'org456xyz',
        projectId: 'proj789abc',
        workspaceId: 'workspace789',
        type: 'plan',
        tool: 'tofu',
        toolVersion: '1.9.0',
        status: 'pending',
        logs: '',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
    }]
})

const Tags = ["runs"]
const oc = createContract()
export const runsContract = oc.pub
    .prefix("/organizations/{organizationId}/projects/{projectId}/workspaces/{workspaceId}")
    .router({
        get: oc.pub
            .route({
                method: "GET",
                path: "/runs/{runId}",
                description: 'Get a run',
                successDescription: 'The requested run',
                tags: Tags,
            })
            .input(
                RunSchema.pick({ organizationId: true, projectId: true, workspaceId: true }).extend({
                    runId: RunSchema.shape.id,
                })
            )
            .output(
                RunSchema
            )
            .errors({
                NOT_FOUND
            }),
        list: oc.pub
            .route({
                method: "GET",
                path: "/runs",
                description: 'Get a list of runs in a workspace',
                successDescription: 'A list of runs',
                tags: Tags,
            })
            .input(
                RunSchema.pick({ organizationId: true, projectId: true, workspaceId: true })
            )
            .output(
                ListSchema(RunSchema)
            ),
        create: oc.auth
            .route({
                method: "POST",
                path: "/runs",
                description: 'Create a run in a workspace',
                successDescription: 'The new run',
                tags: Tags,
            })
            .input(
                RunSchema.pick({ organizationId: true, projectId: true, workspaceId: true, type: true })
            )
            .output(
                RunSchema
            )
            .errors({
                FORBIDDEN
            }),
        update: oc.auth
            .route({
                method: "PATCH",
                path: "/runs/{runId}",
                description: 'Update a run',
                successDescription: 'The updated run',
                tags: Tags,
            })
            .input(
                RunSchema.pick({ status: true, logs: true }).partial().extend({
                    organizationId: RunSchema.shape.organizationId,
                    projectId: RunSchema.shape.projectId,
                    workspaceId: RunSchema.shape.workspaceId,
                    runId: RunSchema.shape.id,
                })
            )
            .output(
                RunSchema
            )
            .errors({
                NOT_FOUND,
                FORBIDDEN,
            }),
        delete: oc.auth
            .route({
                method: "DELETE",
                path: "/runs/{runId}",
                description: 'Delete a run',
                successDescription: 'Run deleted',
                successStatus: 204,
                tags: Tags,
            })
            .input(
                z.object({
                    organizationId: RunSchema.shape.organizationId,
                    projectId: RunSchema.shape.projectId,
                    workspaceId: RunSchema.shape.workspaceId,
                    runId: RunSchema.shape.id,
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
