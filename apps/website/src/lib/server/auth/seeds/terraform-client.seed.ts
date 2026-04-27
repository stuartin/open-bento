import { dev } from "$app/environment"
import { auth } from ".."

export const seedTerraformClient = async () => {
    const context = await auth.$context
    const adapter = context.adapter
    const CLIENT_ID = "terraform-cli"

    if (dev) {
        await adapter.delete({
            model: "oauthClient",
            where: [{ field: "clientId", value: CLIENT_ID }]
        })
    }

    const existing = await adapter.findOne<{ id: string }>({
        model: "oauthClient",
        where: [{ field: "clientId", value: CLIENT_ID }],
    })

    if (existing) return existing

    const client = await adapter.create({
        model: "oauthClient",
        data: {
            clientId: CLIENT_ID,
            name: CLIENT_ID,
            redirectUris: [
                "http://localhost:10000/login",
                "http://localhost:10001/login",
                "http://localhost:10002/login",
                "http://localhost:10003/login",
                "http://localhost:10004/login",
                "http://localhost:10005/login",
                "http://localhost:10006/login",
                "http://localhost:10007/login",
                "http://localhost:10008/login",
                "http://localhost:10009/login",
                "http://localhost:10010/login",
            ],
            skipConsent: true,
            public: true,
            tokenEndpointAuthMethod: "none",
            responseTypes: [
                "code"
            ],
            grantTypes: [
                "authorization_code"
            ],
            scopes: [
                "openid",
                "profile",
                "email",
                "offline_access",
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        },
    })

    return client
}