import { oc } from '@orpc/contract'
import z from 'zod'
import { IdSchema } from '../lib/shared'
import { NOT_FOUND } from '../lib/errors'

const Tags = ["projects"]

export const ProjectSchema = z.object({
    id: IdSchema,
    organizationId: IdSchema,
    name: z.string().describe('The name of the project'),
})

export const projectsContract = {
    get: oc
        .route({
            method: "GET",
            path: "/projects/{projectId}",
            description: 'the description',
            successDescription: 'the success description',
            tags: Tags,
        })
        .errors({
            NOT_FOUND
        })
        .input(
            z.object({ projectId: IdSchema })
        )
        .output(
            ProjectSchema
        )
}