import { contract } from "@open-bento/types";
import { createRouter } from "../../lib/orpc";
import { saveStreamWithType } from "../../lib/file-download";

const os = createRouter(contract.tfe.uploads);
export const tfeUploadsRouter = os.router({
    uploads: os.uploads.handler(async ({ context, input, errors }) => {
        const { query, body } = input

        const verifiedUrl = await context.auth.api.verifySignedUrl({
            query: { token: query.token }
        })
        if (!verifiedUrl.ok) throw errors.BAD_REQUEST()


        const { ok } = await saveStreamWithType(
            body,
            `${verifiedUrl.identifier}`
        );
        if (!ok) throw errors.BAD_REQUEST()

        context.resHeaders?.set("TFP-API-Version", "2.6")
        return
    })
})
