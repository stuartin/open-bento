import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { RESOURCE, tfeContract, toCamel, toKebab } from "@open-bento/tfe";
import { db } from "$features/db";
import { workspaces } from "$features/db/schema";
import { eq } from "drizzle-orm";

const os = createRouter(tfeContract.workspaces).use(useAuth);
export const tfeWorkspacesRouter = os
    .router({
        create: os.create.handler(async ({ errors, input, context }) => {
            // check if user has permissions...
            const organization = await db.query.organizations.findFirst({
                where: {
                    slug: input.params.organization
                }
            })

            if (!organization) throw errors.NOT_FOUND()
            if (!context.user.organizationIds.includes(organization.id)) throw errors.UNAUTHORIZED()

            const workspace = await db
                .insert(workspaces)
                .values({
                    organizationId: organization.id,
                    name: input.body.data.attributes.name
                })
                .returning()
                .get()

            return {
                status: 200,
                body: {
                    data: {
                        type: RESOURCE.WORKSPACES,
                        id: workspace.id,
                        attributes: toKebab(workspace)
                    }
                }
            }
        }),
        update: os.update.handler(async ({ errors, input }) => {
            const existingWorkspace = await db.query.workspaces.findFirst({
                where: {
                    id: input.params["workspace-id"]
                }
            })

            if (!existingWorkspace) throw errors.NOT_FOUND()

            const workspace = await db
                .update(workspaces)
                .set(toCamel(input.body.data.attributes))
                .where(eq(workspaces.id, existingWorkspace.id))
                .returning()
                .get()

            return {
                status: 200,
                body: {
                    data: {
                        type: RESOURCE.WORKSPACES,
                        id: workspace.id,
                        attributes: toKebab(workspace)
                    }
                }
            }

        }),
        get: os.get.handler(async ({ errors, input }) => {

            const workspace = await db.query.workspaces.findFirst({
                where: {
                    name: input.params.workspace
                }
            })

            if (!workspace) throw errors.NOT_FOUND()

            return {
                status: 200,
                body: {
                    data: {
                        type: RESOURCE.WORKSPACES,
                        id: workspace.id,
                        attributes: toKebab(workspace)
                    }
                }
            }
        }),
        list: os.list.handler(async ({ errors, input }) => {

            const workspaces = await db.query.workspaces.findMany({
                where: {
                    organization: {
                        slug: input.params.organization
                    }
                }
            })

            return {
                status: 200,
                body: {
                    data: workspaces.map(workspace => ({
                        type: RESOURCE.WORKSPACES,
                        id: workspace.id,
                        attributes: toKebab(workspace)
                    }))
                }
            }

        })

    })
