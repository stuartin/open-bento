import type { RequestHandler } from '@sveltejs/kit'
import { json } from '@sveltejs/kit';
import { TERRAFORM_CLI_CLIENT_ID } from "../../../../lib/constants"

export const GET: RequestHandler = async ({ request }) => {
    return json({
        // https://app.terraform.io/.well-known/terraform.json
        "login.v1": {
            client: TERRAFORM_CLI_CLIENT_ID,
            grant_types: ["authz_code"],
            authz: "/api/v1/auth/oauth2/authorize",
            token: "/api/v1/auth/oauth2/token",
            ports: [10000, 10010],
        },
        "tfe.v2": "/api/v1/tfe"
    })
}