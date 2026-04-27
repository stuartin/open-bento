import { createAuthClient } from "better-auth/client"
import { jwtClient, organizationClient, usernameClient } from "better-auth/client/plugins"
import { API_PREFIX, ORIGIN } from "./constants"
import { oauthProviderClient } from "@better-auth/oauth-provider/client"

export const authClient = createAuthClient({
    baseURL: ORIGIN,
    basePath: `${API_PREFIX}/auth`,
    plugins: [
        jwtClient(),
        usernameClient(),
        organizationClient(),
        oauthProviderClient()
    ]
})