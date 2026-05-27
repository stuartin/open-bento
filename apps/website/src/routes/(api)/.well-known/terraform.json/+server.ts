import type { RequestHandler } from '@sveltejs/kit'
import { json } from '@sveltejs/kit';
import { TERRAFORM_CLI_CLIENT_ID } from "../../../../lib/constants"
import { env } from "../../../../features/env/env.public"

export const GET: RequestHandler = async () => {
    return json({
        // https://app.terraform.io/.well-known/terraform.json
        "login.v1": {
            client: TERRAFORM_CLI_CLIENT_ID,
            grant_types: ["authz_code"],
            authz: `${env.API_PREFIX}/auth/oauth2/authorize`,
            token: `${env.API_PREFIX}/auth/oauth2/token`,
            ports: [10000, 10010],
        },
        "tfe.v2": `${env.API_PREFIX}/tfe`,
    })
}