import z from 'zod'
import { createContract } from '../../lib/orpc.contract'

const Tags = ['Cloud']
const oc = createContract()
export const cloudsPingContract = oc.pub
    .prefix("/cloud/v2")
    .router({
        ping: oc.pub
            .route({
                method: "GET",
                path: "/ping",
                description: 'Get a folder in a project',
                successDescription: 'The requested folder',
                successStatus: 204,
                tags: Tags,
            })
    })  