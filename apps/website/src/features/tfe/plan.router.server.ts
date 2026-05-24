import { API_PREFIX, ORIGIN } from "$lib/constants";
import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { GetPlanJsonOutputOutput, GetPlanOutput, tfeContract } from "@open-bento/tfe";

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
                        "log-read-url": `${ORIGIN}${API_PREFIX}/tfe/read-logs/${input.params.plan}`,
                    },
                }
            })

            if (!plan.success) throw errors.BAD_REQUEST(plan.error)

            return {
                status: 200,
                body: plan.data
            }
        }),

        jsonOutput: os.jsonOutput.handler(async ({ input, errors }) => {

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
