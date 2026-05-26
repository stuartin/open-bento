import { saveStreamWithType } from "./lib/save-to-disk";
import { createRouter } from "$features/orpc/factories";
import { tfeContract } from "@open-bento/tfe";
import { db } from "$features/db";
import { configurationVersions } from "$features/db/schema";
import { eq } from "drizzle-orm";

const os = createRouter(tfeContract.uploads);
export const tfeUploadsRouter = os.router({
    uploadFile: os.uploadFile.handler(async ({ context, input, errors }) => {
        const { query, body } = input

        const verifiedUrl = await context.auth.api.verifySignedUrl({
            query: { token: query.token }
        })
        if (!verifiedUrl.ok) throw errors.BAD_REQUEST()

        const configurationVersion = await db.query.configurationVersions.findFirst({
            where: {
                id: verifiedUrl.identifier
            },
        })

        if (!configurationVersion) throw errors.NOT_FOUND()

        const { ok } = await saveStreamWithType(
            body,
            `${configurationVersion.id}`,
            `./uploads/${configurationVersion.organizationId}/${configurationVersion.workspaceId}`
        );

        await db
            .update(configurationVersions)
            .set({ status: ok ? "uploaded" : "errored", uploadUrl: null })
            .where(eq(configurationVersions.id, configurationVersion.id))
    })
})
