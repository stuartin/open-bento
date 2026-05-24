import { saveStreamWithType } from "./lib/save-to-disk";
import type { ReadableStream } from "stream/web";
import { createRouter } from "$features/orpc/factories";
import { tfeContract } from "@open-bento/tfe";

const os = createRouter(tfeContract.uploads);
export const tfeUploadsRouter = os.router({
    uploadFile: os.uploadFile.handler(async ({ context, input, errors }) => {
        const { query, body } = input

        const verifiedUrl = await context.auth.api.verifySignedUrl({
            query: { token: query.token }
        })
        if (!verifiedUrl.ok) throw errors.BAD_REQUEST()


        const { ok } = await saveStreamWithType(
            body as ReadableStream,
            `${verifiedUrl.identifier}`
        );
        if (!ok) throw errors.BAD_REQUEST()
    })
})
