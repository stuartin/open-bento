import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { GetCurrentStateVersionOutput, GetStateVersionOutput, ListStateVersionsOutput, tfeContract } from "@open-bento/tfe";

const os = createRouter(tfeContract.stateVersions).use(useAuth);
export const tfeStateVersionsRouter = os
    .router({
        getCurrent: os.getCurrent.handler(async ({ errors }) => {

            const currentVersion = GetCurrentStateVersionOutput.shape.body.safeParse({
                data: {
                    type: "state-versions",
                    id: "id-state-versions",
                    attributes: {
                        "created-at": new Date().toISOString(),
                        serial: 1,
                        status: "finalized",
                        "hosted-state-download-url": "",
                    }
                }
            })

            if (!currentVersion.success) throw errors.BAD_REQUEST(currentVersion.error)

            // For testing we assume there is no state
            if (!currentVersion.data?.data.attributes["hosted-state-download-url"]) throw errors.NOT_FOUND()

            return {
                status: 200,
                body: currentVersion.data
            }
        }),
        get: os.get.handler(async ({ errors }) => {

            const version = GetStateVersionOutput.shape.body.safeParse({
                data: {
                    type: "state-versions",
                    id: "id-state-versions",
                    attributes: {
                        "created-at": new Date().toISOString(),
                        serial: 1,
                        status: "finalized",
                        "hosted-state-download-url": "",
                    }
                }
            })

            if (!version.success) throw errors.BAD_REQUEST(version.error)

            return {
                status: 200,
                body: version.data
            }
        }),
        list: os.list.handler(async ({ errors }) => {

            const versions = ListStateVersionsOutput.shape.body.safeParse({
                data: [{
                    type: "state-versions",
                    id: "id-state-versions",
                    attributes: {
                        "created-at": new Date().toISOString(),
                        serial: 1,
                        status: "finalized",
                        "hosted-state-download-url": "",
                    }
                }]
            })

            if (!versions.success) throw errors.BAD_REQUEST(versions.error)

            return {
                status: 200,
                body: versions.data
            }
        }),
    })
