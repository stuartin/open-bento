import z from 'zod'
import { IdSchema, ListSchema } from '../lib/shared'
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../lib/errors'
import { createContract } from '../lib/orpc.contract'
import { ProjectSchema } from './projects.contract'

const Tags = ["upload"]
const oc = createContract()
export const uploadsContract = oc.auth
    .router({
        upload: oc.auth
            .route({
                method: "PUT",
                path: "/upload",
                description: 'Upload a file',
                successDescription: 'The requested organization',
                tags: Tags,
            })
            .input(
                z.file()
            )
            .output(
                z.object({
                    id: IdSchema
                })
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
