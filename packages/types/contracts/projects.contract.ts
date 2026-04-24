import z from 'zod'
import { IdSchema, ListSchema } from '../lib/shared'
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../lib/errors'
import { createContract } from '../lib/orpc.contract'

export const ProjectSchema = z.object({
    id: IdSchema.meta({ description: 'The project id' }),
    organizationId: IdSchema.meta({ description: 'The organization id' }),
    name: z.string().meta({ description: 'The project name' }),
}).meta({
    description: 'A project',
    examples: [{
        id: '1234njsd',
        organizationId: 'as8jmmss',
        name: 'my-project',
    }]
})

const Tags = ["projects"]
const oc = createContract()
export const projectsContract = oc.pub
    .prefix("/organizations/{organizationId}")
    .router({
        get: oc.pub
            .route({
                method: "GET",
                path: "/projects/{projectId}",
                description: 'Get a project in an organization',
                successDescription: 'The requested project',
                tags: Tags,
            })
            .input(
                ProjectSchema.pick({ organizationId: true }).extend({
                    projectId: ProjectSchema.shape.id,
                })
            )
            .output(
                ProjectSchema
            )
            .errors({
                NOT_FOUND
            }),
        list: oc.pub
            .route({
                method: "GET",
                path: "/projects",
                description: 'Get a list of projects in an organization',
                successDescription: 'A list of projects',
                tags: Tags,
            })
            .input(
                ProjectSchema.pick({ organizationId: true })
            )
            .output(
                ListSchema(ProjectSchema)
            ),
        create: oc.auth
            .route({
                method: "POST",
                path: "/projects",
                description: 'Create a project in an organization',
                successDescription: 'The new project',
                tags: Tags,
            })
            .input(
                ProjectSchema
            )
            .output(
                ProjectSchema
            )
            .errors({
                FORBIDDEN,
                CONFLICT
            }),
        update: oc.auth
            .route({
                method: "PATCH",
                path: "/projects/{projectId}",
                description: 'Update a project in an organization',
                successDescription: 'The updated project',
                tags: Tags,
            })
            .input(
                ProjectSchema.omit({ id: true, organizationId: true }).partial().extend({
                    projectId: ProjectSchema.shape.id,
                    organizationId: ProjectSchema.shape.organizationId
                })
            )
            .output(
                ProjectSchema
            )
            .errors({
                NOT_FOUND,
                FORBIDDEN,
            }),
        delete: oc.auth
            .route({
                method: "DELETE",
                path: "/projects/{projectId}",
                description: 'Delete a project in an organization',
                successDescription: 'Project deleted',
                successStatus: 204,
                tags: Tags,
            })
            .input(
                ProjectSchema.omit({ id: true, organizationId: true }).partial().extend({
                    projectId: ProjectSchema.shape.id,
                    organizationId: ProjectSchema.shape.organizationId,
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