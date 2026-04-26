import z from 'zod'
import { IdSchema, ListSchema } from '../lib/shared'
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../lib/errors'
import { createContract } from '../lib/orpc.contract'
import { JobSchema } from './jobs.contract'

export const FolderSchema = z.object({
    id: IdSchema.meta({ description: 'The folder id' }),
    organizationId: IdSchema.meta({ description: 'The organization id' }),
    projectId: IdSchema.meta({ description: 'The project id' }),
    name: z.string().meta({ description: 'The folder name' }),
    jobs: JobSchema.array().meta({ description: 'A list of jobs ran in the folder' }),
    createdAt: z.date().meta({ description: 'The folder creation date' }),
    updatedAt: z.date().meta({ description: 'The folder last update date' }),
}).meta({
    description: 'A folder',
    examples: [{
        id: 'folder123',
        organizationId: 'org456xyz',
        projectId: 'proj789abc',
        name: 'my-folder',
        jobs: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
    }]
})

const Tags = ["folders"]
const oc = createContract()
export const foldersContract = oc.pub
    .prefix("/organizations/{organizationId}/projects/{projectId}")
    .router({
        get: oc.pub
            .route({
                method: "GET",
                path: "/folders/{folderId}",
                description: 'Get a folder in a project',
                successDescription: 'The requested folder',
                tags: Tags,
            })
            .input(
                FolderSchema.pick({ organizationId: true, projectId: true }).extend({
                    folderId: FolderSchema.shape.id,
                })
            )
            .output(
                FolderSchema
            )
            .errors({
                NOT_FOUND
            }),
        list: oc.pub
            .route({
                method: "GET",
                path: "/folders",
                description: 'Get a list of folders in a project',
                successDescription: 'A list of folders',
                tags: Tags,
            })
            .input(
                FolderSchema.pick({ organizationId: true, projectId: true })
            )
            .output(
                ListSchema(FolderSchema)
            ),
        create: oc.auth
            .route({
                method: "POST",
                path: "/folders",
                description: 'Create a folder in a project',
                successDescription: 'The new folder',
                tags: Tags,
            })
            .input(
                FolderSchema.pick({ organizationId: true, projectId: true, name: true })
            )
            .output(
                FolderSchema
            )
            .errors({
                FORBIDDEN,
                CONFLICT
            }),
        update: oc.auth
            .route({
                method: "PATCH",
                path: "/folders/{folderId}",
                description: 'Update a folder in a project',
                successDescription: 'The updated folder',
                tags: Tags,
            })
            .input(
                FolderSchema.pick({ name: true }).partial().extend({
                    organizationId: FolderSchema.shape.organizationId,
                    projectId: FolderSchema.shape.projectId,
                    folderId: FolderSchema.shape.id,
                })
            )
            .output(
                FolderSchema
            )
            .errors({
                NOT_FOUND,
                FORBIDDEN,
            }),
        delete: oc.auth
            .route({
                method: "DELETE",
                path: "/folders/{folderId}",
                description: 'Delete a folder in a project',
                successDescription: 'Folder deleted',
                successStatus: 204,
                tags: Tags,
            })
            .input(
                z.object({
                    organizationId: FolderSchema.shape.organizationId,
                    projectId: FolderSchema.shape.projectId,
                    folderId: FolderSchema.shape.id,
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
