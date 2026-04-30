import { auth } from "$lib/server/auth";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request, url }) => {

    const token = url.searchParams.get("token") || ""

    try {
        const result = await auth.api.verifySignedUrl({
            query: {
                token
            }
        })

        return json(result)
    } catch (err) {
        error(400, "Invalid token")
    }

}