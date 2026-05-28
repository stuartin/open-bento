import { retrieveFromDisk, saveToDisk } from "./lib/local-storage";
import { createRouter } from "$features/orpc/factories";
import { tfeContract, type ConfigurationVersion } from "@open-bento/tfe";
import { db } from "$features/db";
import { configurationVersions } from "$features/db/schema";
import { eq } from "drizzle-orm";
import { env } from "$features/env/env.server";
import type { ReadableStream } from "node:stream/web";
import { isAPIError } from "better-auth/api";

const configurationVersionPath = (cv: { organizationId: string, workspaceId: string }) => `${env.STORAGE_PATH}/uploads/${cv.organizationId}/${cv.workspaceId}`

const os = createRouter(tfeContract.storage);
export const tfeStorageRouter = os.router({
    upload: os.upload.handler(async ({ context, input, errors }) => {
        const { query, body } = input

        const verified = await context.auth.api.verifySignedUrl({
            query: { token: query.token }
        }).catch(() => ({ ok: false, identifier: undefined }))

        if (!verified.ok) throw errors.BAD_REQUEST()

        const configurationVersion = await db.query.configurationVersions.findFirst({
            where: {
                id: verified.identifier
            },
        })

        if (!configurationVersion) throw errors.NOT_FOUND()

        const { ok } = await saveToDisk(
            body as ReadableStream,
            configurationVersionPath(configurationVersion),
            `${configurationVersion.id}`,
        );

        await db
            .update(configurationVersions)
            .set({ status: ok ? "uploaded" : "errored", uploadUrl: null })
            .where(eq(configurationVersions.id, configurationVersion.id))
    }),

    download: os.download.handler(async ({ context, input, errors }) => {
        const { query } = input

        const verified = await context.auth.api.verifySignedUrl({
            query: { token: query.token }
        }).catch(() => ({ ok: false, identifier: undefined }))

        if (!verified.ok) throw errors.BAD_REQUEST()

        const configurationVersion = await db.query.configurationVersions.findFirst({
            where: {
                id: verified.identifier
            },
        })

        if (!configurationVersion) throw errors.NOT_FOUND()

        const { ok, file } = await retrieveFromDisk(
            configurationVersionPath(configurationVersion),
            configurationVersion.id
        );
        if (!ok) throw errors.NOT_FOUND()

        return {
            status: 200,
            body: file
        }
    })
})
