import { oc } from '@orpc/contract'
import z from 'zod'
import { IdSchema, ListSchema } from '../lib/shared'
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../lib/errors'

const Tags = ["projects"]

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

export const projectsContract = {
    get: oc
        .route({
            method: "GET",
            path: "/organizations/{organizationId}/projects/{projectId}",
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
    list: oc
        .route({
            method: "GET",
            path: "/organizations/{organizationId}/projects",
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
    create: oc
        .route({
            method: "POST",
            path: "/organizations/{organizationId}/projects",
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
    update: oc
        .route({
            method: "PATCH",
            path: "/organizations/{organizationId}/projects/{projectId}",
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
    delete: oc
        .route({
            method: "DELETE",
            path: "/organizations/{organizationId}/projects/{projectId}",
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
}