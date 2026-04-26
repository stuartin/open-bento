import z from 'zod'
import { IdSchema, ListSchema } from '../lib/shared'
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../lib/errors'
import { createContract } from '../lib/orpc.contract'

export const JobTypeSchema = z.enum(['plan', 'apply'])
export const JobStatusSchema = z.enum(['pending', 'started', 'running', 'success', 'error'])
export const JobToolSchema = z.enum(['tofu', 'terraform'])

export const JobSchema = z.object({
    id: IdSchema.meta({ description: 'The job id' }),
    organizationId: IdSchema.meta({ description: 'The organization id' }),
    projectId: IdSchema.meta({ description: 'The project id' }),
    folderId: IdSchema.meta({ description: 'The folder id' }),
    type: JobTypeSchema.meta({ description: 'The job type' }),
    tool: JobToolSchema.default("tofu").meta({ description: 'The IaC tool to use' }),
    toolVersion: z.string().default("1.9.1").meta({ description: 'The tool version' }),
    status: JobStatusSchema.meta({ description: 'The job status' }),
    logs: z.string().meta({ description: 'The job logs' }),
    createdAt: z.date().meta({ description: 'The job creation date' }),
    updatedAt: z.date().meta({ description: 'The job last update date' }),
}).meta({
    description: 'A job',
    examples: [{
        id: 'abc123def',
        organizationId: 'org456xyz',
        projectId: 'proj789abc',
        folderId: 'folder789',
        type: 'plan',
        tool: 'tofu',
        toolVersion: '1.9.0',
        status: 'pending',
        logs: '',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
    }]
})

const Tags = ["jobs"]
const oc = createContract()
export const jobsContract = oc.pub
    .prefix("/organizations/{organizationId}/projects/{projectId}/folders/{folderId}")
    .router({
        get: oc.pub
            .route({
                method: "GET",
                path: "/jobs/{jobId}",
                description: 'Get a job',
                successDescription: 'The requested job',
                tags: Tags,
            })
            .input(
                JobSchema.pick({ organizationId: true, projectId: true, folderId: true }).extend({
                    jobId: JobSchema.shape.id,
                })
            )
            .output(
                JobSchema
            )
            .errors({
                NOT_FOUND
            }),
        list: oc.pub
            .route({
                method: "GET",
                path: "/jobs",
                description: 'Get a list of jobs in a folder',
                successDescription: 'A list of jobs',
                tags: Tags,
            })
            .input(
                JobSchema.pick({ organizationId: true, projectId: true, folderId: true })
            )
            .output(
                ListSchema(JobSchema)
            ),
        create: oc.auth
            .route({
                method: "POST",
                path: "/jobs",
                description: 'Create a job in a folder',
                successDescription: 'The new job',
                tags: Tags,
            })
            .input(
                JobSchema.pick({ organizationId: true, projectId: true, folderId: true, type: true })
            )
            .output(
                JobSchema
            )
            .errors({
                FORBIDDEN
            }),
        update: oc.auth
            .route({
                method: "PATCH",
                path: "/jobs/{jobId}",
                description: 'Update a job',
                successDescription: 'The updated job',
                tags: Tags,
            })
            .input(
                JobSchema.pick({ status: true, logs: true }).partial().extend({
                    organizationId: JobSchema.shape.organizationId,
                    projectId: JobSchema.shape.projectId,
                    folderId: JobSchema.shape.folderId,
                    jobId: JobSchema.shape.id,
                })
            )
            .output(
                JobSchema
            )
            .errors({
                NOT_FOUND,
                FORBIDDEN,
            }),
        delete: oc.auth
            .route({
                method: "DELETE",
                path: "/jobs/{jobId}",
                description: 'Delete a job',
                successDescription: 'Job deleted',
                successStatus: 204,
                tags: Tags,
            })
            .input(
                z.object({
                    organizationId: JobSchema.shape.organizationId,
                    projectId: JobSchema.shape.projectId,
                    folderId: JobSchema.shape.folderId,
                    jobId: JobSchema.shape.id,
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
