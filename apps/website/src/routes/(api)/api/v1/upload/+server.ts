import { auth } from "$lib/server/auth";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { APIError } from "better-auth";

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
        if (err instanceof APIError) {
            return error(err.statusCode, err.message)
        }
    }

    error(500, "Unknown error")
}