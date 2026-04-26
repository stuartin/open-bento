import z from 'zod'
import { IdSchema, ListSchema } from '../lib/shared'
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../lib/errors'
import { createContract } from '../lib/orpc.contract'
import { ProjectSchema } from './projects.contract'

export const OrganizationSchema = z.object({
    id: IdSchema.meta({ description: 'The organization id' }),
    name: z.string().meta({ description: 'The organization name' }),
    projects: ProjectSchema.array().meta({ description: 'A list of projects in the organization' }),
    createdAt: z.date().meta({ description: 'The organization creation date' }),
    updatedAt: z.date().meta({ description: 'The organization last update date' }),
}).meta({
    description: 'An organization',
    examples: [{
        id: 'org123abc',
        name: 'my-organization',
        projects: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
    }]
})

const Tags = ["organizations"]
const oc = createContract()
export const organizationsContract = oc.pub
    .prefix("/organizations")
    .router({
        get: oc.pub
            .route({
                method: "GET",
                path: "/{organizationId}",
                description: 'Get an organization',
                successDescription: 'The requested organization',
                tags: Tags,
            })
            .input(
                z.object({
                    organizationId: OrganizationSchema.shape.id,
                })
            )
            .output(
                OrganizationSchema
            )
            .errors({
                NOT_FOUND
            }),
        list: oc.pub
            .route({
                method: "GET",
                path: "/",
                description: 'Get a list of organizations',
                successDescription: 'A list of organizations',
                tags: Tags,
            })
            .input(z.object({}))
            .output(
                ListSchema(OrganizationSchema)
            ),
        create: oc.auth
            .route({
                method: "POST",
                path: "/",
                description: 'Create an organization',
                successDescription: 'The new organization',
                tags: Tags,
            })
            .input(
                OrganizationSchema.pick({ name: true })
            )
            .output(
                OrganizationSchema
            )
            .errors({
                FORBIDDEN,
                CONFLICT
            }),
        update: oc.auth
            .route({
                method: "PATCH",
                path: "/{organizationId}",
                description: 'Update an organization',
                successDescription: 'The updated organization',
                tags: Tags,
            })
            .input(
                OrganizationSchema.pick({ name: true }).partial().extend({
                    organizationId: OrganizationSchema.shape.id,
                })
            )
            .output(
                OrganizationSchema
            )
            .errors({
                NOT_FOUND,
                FORBIDDEN,
            }),
        delete: oc.auth
            .route({
                method: "DELETE",
                path: "/{organizationId}",
                description: 'Delete an organization',
                successDescription: 'Organization deleted',
                successStatus: 204,
                tags: Tags,
            })
            .input(
                z.object({
                    organizationId: OrganizationSchema.shape.id,
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
