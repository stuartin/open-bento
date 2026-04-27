import { createAuthClient } from "better-auth/client"
import { organizationClient, usernameClient } from "better-auth/client/plugins"
import { API_PREFIX, ORIGIN } from "./constants"

export const authClient = createAuthClient({
    baseURL: ORIGIN,
    basePath: `${API_PREFIX}/auth`,
    plugins: [
        usernameClient(),
        organizationClient()
    ]
})

// authClient.organization.setActive({
//     organizationId:
// })