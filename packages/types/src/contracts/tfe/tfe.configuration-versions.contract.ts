import z from 'zod';
import { NOT_FOUND, FORBIDDEN, CONFLICT } from '../../lib/errors'
import { createContract } from '../../lib/orpc.contract'
import { toEntityResponseSchema } from '../../lib/tfe';
import { TFEConfigurationVersionSchema } from './tfe.workspaces.contract';

const Tags = ['tfe']
const oc = createContract()
export const tfeConfigurationVersionsContract = oc.auth
    .prefix("/tfe")
    .router({
        getConfigurationVersions: oc.auth
            .route({
                method: "GET",
                path: "/configuration-versions/{configuration}",
                tags: Tags,
            })
            .input(
                z.object({
                    configuration: z.string(),
                })
            )
            .output(
                toEntityResponseSchema("configuration-versions", TFEConfigurationVersionSchema)
            )
            .errors({
                NOT_FOUND
            }),

    })
