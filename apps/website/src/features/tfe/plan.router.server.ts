import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { GetPlanJsonOutputOutput, GetPlanOutput, tfeContract } from "@open-bento/tfe";
import { env } from "$features/env/env.public";

const os = createRouter(tfeContract.plans).use(useAuth);
export const tfePlansRouter = os
    .router({
        get: os.get.handler(async ({ input, errors }) => {

            const plan = GetPlanOutput.shape.body.safeParse({
                data: {
                    type: "plans",
                    id: input.params.plan,
                    attributes: {
                        status: "finished",
                        "generated-configuration": false,
                        "has-changes": true,
                        "resource-additions": 2,
                        "resource-changes": 1,
                        "resource-destructions": 0,
                        "log-read-url": `${env.ORIGIN}${env.API_PREFIX}/tfe/read-logs/${input.params.plan}`,
                    },
                }
            })

            if (!plan.success) throw errors.BAD_REQUEST(plan.error)

            return {
                status: 200,
                body: plan.data
            }
        }),

        jsonOutput: os.jsonOutput.handler(async ({ errors }) => {

            const jsonOutput = GetPlanJsonOutputOutput.shape.body.safeParse({
                format_version: "1.2",
                terraform_version: "1.7.3",
                planned_values: {},
                resource_changes: [],
                output_changes: {},
                prior_state: {},
                configuration: {}
            })

            if (!jsonOutput.success) throw errors.BAD_REQUEST(jsonOutput.error)

            return {
                status: 200,
                body: jsonOutput.data
            }
        })
    })
