import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { CreateConfigurationVersionOutput, GetConfigurationVersionOutput, tfeContract } from "@open-bento/tfe";
import { createId } from "@paralleldrive/cuid2";

const os = createRouter(tfeContract.configurationVersions).use(useAuth);
export const tfeConfigurationVersionsRouter = os
    .router({
        create: os.create.handler(async ({ input, context, errors }) => {

            const cuid2 = createId()
            const id = `${input.params.workspace}-${cuid2}`

            const { url } = await context.auth.api.generateSignedUrl({
                headers: context.request.headers,
                body: { identifier: id }
            })

            const configurationVersion = CreateConfigurationVersionOutput.shape.body.safeParse({
                data: {
                    type: "configuration-versions",
                    id,
                    attributes: {
                        ...input.body.data.attributes,
                        status: "pending",
                        "upload-url": url,
                    }
                }
            })

            if (!configurationVersion.success) throw errors.BAD_REQUEST(configurationVersion.error)

            return {
                status: 201,
                body: configurationVersion.data
            }
        }),
        get: os.get.handler(async ({ errors, input }) => {

            const configurationVersion = GetConfigurationVersionOutput.shape.body.safeParse({
                data: {
                    type: "configuration-versions",
                    id: input.params.version,
                    attributes: {
                        "auto-queue-runs": false,
                        speculative: true,
                        provisional: false,
                        status: "uploaded",
                        "upload-url": "",
                    }
                }
            })

            if (!configurationVersion.success) throw errors.BAD_REQUEST(configurationVersion.error)

            return {
                status: 200,
                body: configurationVersion.data
            }
        }),
    })
