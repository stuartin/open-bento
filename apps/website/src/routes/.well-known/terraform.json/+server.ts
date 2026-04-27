import type { RequestHandler } from '@sveltejs/kit'
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
    return json({
        "login.v1": {
            client: "terraform-cli",
            grant_types: ["authz_code"],
            authz: "/api/v1/auth/oauth2/authorize",
            token: "/api/v1/auth/oauth2/token",
            ports: [10000, 10010],
        }
    })
}