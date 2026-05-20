import { createRouter } from "$lib/server/api/lib/orpc";
import { useAuth } from "$lib/server/api/middleware/use-auth";
import { JsonApiCollection, JsonApiDocument, tfeContract, WorkspaceAttributesSchema } from "@open-bento/tfe";

const os = createRouter(tfeContract.workspaces).use(useAuth);
export const tfeWorkspacesRouter = os
    .router({
        get: os.get.handler(async ({ errors }) => {

            const workspace = JsonApiDocument(
                "workspaces",
                WorkspaceAttributesSchema
            ).safeParse({
                data: {
                    type: "workspaces",
                    id: "id-workspaces",
                    attributes: {
                        name: "workspace",
                        "execution-mode": "remote",
                        "terraform-version": "1.7.3",
                        locked: false,
                    }
                }
            })

            if (!workspace.success) throw errors.BAD_REQUEST(workspace.error)

            return {
                status: 200,
                body: workspace.data
            }
        }),
        list: os.list.handler(async ({ errors }) => {

            const workspaces = JsonApiCollection(
                "workspaces",
                WorkspaceAttributesSchema
            ).safeParse({
                data: [{
                    type: "workspaces",
                    id: "id-workspaces",
                    attributes: {
                        name: "workspace",
                        "execution-mode": "remote",
                        "terraform-version": "1.7.3",
                        locked: false,
                    }
                }]
            })

            if (!workspaces.success) throw errors.BAD_REQUEST(workspaces.error)

            return {
                status: 200,
                body: workspaces.data
            }

        })

    })
