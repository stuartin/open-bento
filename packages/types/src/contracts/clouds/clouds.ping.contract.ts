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
                description: 'Ping the cloud API',
                successDescription: 'Ping successful',
                successStatus: 204,
                tags: Tags,
            })
    })  