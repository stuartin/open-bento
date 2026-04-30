import { createContract } from '../../lib/orpc.contract'

const Tags = ['tfe']
const oc = createContract()
export const tfePingContract = oc.pub
    .prefix("/tfe")
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