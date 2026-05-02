import z from 'zod';
import { NOT_FOUND } from '../../lib/errors'
import { createContract } from '../../lib/orpc.contract'
import { TFEConfigurationVersionSchema } from './tfe.workspaces.contract';

const Tags = ['tfe']
const oc = createContract()
export const tfeConfigurationVersionsContract = oc.auth
    .prefix("/tfe")
    .router({
        getConfigurationVersion: oc.auth
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
                TFEConfigurationVersionSchema
            )
            .errors({
                NOT_FOUND
            }),

    })
