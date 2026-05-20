import { createRouter } from "$lib/server/api/lib/orpc";
import { useAuth } from "$lib/server/api/middleware/use-auth";
import { JsonApiCollection, JsonApiDocument, StateVersionAttributesSchema, tfeContract, WorkspaceAttributesSchema } from "@open-bento/tfe";

const os = createRouter(tfeContract.stateVersions).use(useAuth);
export const tfeStateVersionsRouter = os
    .router({
        getCurrent: os.getCurrent.handler(async ({ errors }) => {

            const currentVersion = JsonApiDocument(
                "state-versions",
                StateVersionAttributesSchema
            ).safeParse({
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

            return {
                status: 200,
                body: currentVersion.data
            }
        }),
        get: os.get.handler(async ({ errors }) => {

            const version = JsonApiDocument(
                "state-versions",
                StateVersionAttributesSchema
            ).safeParse({
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

            const versions = JsonApiCollection(
                "state-versions",
                StateVersionAttributesSchema
            ).safeParse({
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
