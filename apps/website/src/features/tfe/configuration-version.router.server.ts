import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { RESOURCE, tfeContract, toCamel, toKebab } from "@open-bento/tfe";
import { db } from "$features/db";
import { configurationVersions } from "$features/db/schema";
import { eq } from "drizzle-orm";
import { env } from "$features/env/env";

const os = createRouter(tfeContract.configurationVersions).use(useAuth);
export const tfeConfigurationVersionsRouter = os
    .router({
        create: os.create.handler(async ({ input, context, errors }) => {
            // check if user has permissions...
            const workspace = await db.query.workspaces.findFirst({
                where: {
                    id: input.params["workspace-id"]
                }
            })

            if (!workspace) throw errors.NOT_FOUND()
            if (!context.user.organizationIds.includes(workspace.organizationId)) throw errors.UNAUTHORIZED()

            const initialConfigurationVersion = await db
                .insert(configurationVersions)
                .values({
                    organizationId: workspace.organizationId,
                    workspaceId: workspace.id,
                    ...toCamel(input.body.data.attributes)
                })
                .returning()
                .get()

            const { url } = await context.auth.api.generateSignedUrl({
                headers: context.request.headers,
                body: { url: `${env.ORIGIN}${env.API_PREFIX}/tfe/uploads`, identifier: initialConfigurationVersion.id }
            })

            const configurationVersion = await db
                .update(configurationVersions)
                .set({ uploadUrl: url })
                .where(eq(configurationVersions.id, initialConfigurationVersion.id))
                .returning()
                .get()

            return {
                status: 201,
                body: {
                    data: {
                        type: RESOURCE.CONFIGURATION_VERSIONS,
                        id: configurationVersion.id,
                        attributes: toKebab(configurationVersion)
                    }
                }
            }
        }),
        get: os.get.handler(async ({ errors, input }) => {

            const configurationVersion = await db.query.configurationVersions.findFirst({
                where: {
                    id: input.params["version-id"]
                }
            })

            if (!configurationVersion) throw errors.NOT_FOUND()

            return {
                status: 200,
                body: {
                    data: {
                        type: RESOURCE.CONFIGURATION_VERSIONS,
                        id: configurationVersion.id,
                        attributes: toKebab(configurationVersion)
                    }
                }
            }
        }),
        download: os.download.handler(async ({ errors, input, context }) => {

            const configurationVersion = await db.query.configurationVersions.findFirst({
                where: {
                    id: input.params["version-id"]
                }
            })

            if (!configurationVersion) throw errors.NOT_FOUND()
            if (configurationVersion.status !== "uploaded") throw errors.NOT_FOUND()

            const dlUrl = `${env.ORIGIN}${env.API_PREFIX}/tfe/downloads`
            const { url } = await context.auth.api.generateSignedUrl({
                headers: context.request.headers,
                body: { url: dlUrl, identifier: configurationVersion.id }
            })

            context.resHeaders?.set("location", url)
            return {
                status: 302,
                body: url
            }
        }),
    })
