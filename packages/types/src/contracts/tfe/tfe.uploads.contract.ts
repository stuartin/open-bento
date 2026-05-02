import z from 'zod'
import { BAD_REQUEST } from '../../lib/errors'
import { createContract } from '../../lib/orpc.contract'
import { ReadableStream } from 'stream/web'

const Tags = ["upload"]
const oc = createContract()
export const tfeUploadsContract = oc.pub
    .prefix("/tfe")
    .router({
        uploads: oc.pub
            .route({
                method: "PUT",
                path: "/uploads",
                description: 'Upload a file',
                successDescription: 'File uploaded',
                successStatus: 204,
                tags: Tags,
                inputStructure: "detailed"
            })
            .input(
                z.object({
                    body: z.instanceof(ReadableStream),
                    query: z.object({
                        token: z.string()
                    })
                })
            )
            .errors({
                BAD_REQUEST
            }),
    })
