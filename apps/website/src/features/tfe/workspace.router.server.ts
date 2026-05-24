import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { GetWorkspaceOutput, ListWorkspacesOutput, tfeContract } from "@open-bento/tfe";

const os = createRouter(tfeContract.workspaces).use(useAuth);
export const tfeWorkspacesRouter = os
    .router({
        get: os.get.handler(async ({ errors }) => {

            const workspace = GetWorkspaceOutput.shape.body.safeParse({
                data: {
                    type: "workspaces",
                    id: "id-workspaces",
                    attributes: {
                        name: "workspace",
                        "execution-mode": "remote",
                        "terraform-version": "1.7.3",
                        locked: false,
                        permissions: {
                            "can-queue-run": true
                        }
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

            const workspaces = ListWorkspacesOutput.shape.body.safeParse({
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
