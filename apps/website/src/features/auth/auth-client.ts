import { createAuthClient } from "better-auth/client"
import { jwtClient, organizationClient, usernameClient } from "better-auth/client/plugins"
import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import { signedUrlClient } from "./plugins/signed-url"
import { env } from "$features/env/env"

export const authClient = createAuthClient({
    baseURL: env.ORIGIN,
    basePath: `${env.API_PREFIX}/auth`,
    plugins: [
        jwtClient(),
        signedUrlClient(),
        usernameClient(),
        organizationClient(),
        oauthProviderClient()
    ]
})