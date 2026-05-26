import { createRouter } from "$features/orpc/factories";
import { useAuth } from "$features/auth/middleware/use-auth";
import { GetConfigurationVersionOutput, RESOURCE, tfeContract, toCamel, toKebab } from "@open-bento/tfe";
import { db } from "$features/db";
import { configurationVersions } from "$features/db/schema";
import { eq } from "drizzle-orm";

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
                body: { identifier: initialConfigurationVersion.id }
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
