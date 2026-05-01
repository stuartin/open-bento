import { APIError, createAuthEndpoint, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { BetterAuthError, type BetterAuthPlugin, type GenericEndpointContext, type Session, type User } from "better-auth";
import { type OAuthAccessToken } from "better-auth/plugins";
import { z } from "zod"

const getOauthSessionFromCtx = async (ctx: GenericEndpointContext) => {
    let session: {
        session: Session
        user: User
    } | null = null

    try {
        const oauthPlugin = ctx.context?.getPlugin("oauth-provider")
        const userInfoResponse = await oauthPlugin?.endpoints.oauth2UserInfo({
            ...ctx,
            method: "GET",
            asResponse: true,
        })
        const userInfo = await userInfoResponse?.json()

        const oauthToken = await ctx.context.adapter.findOne<OAuthAccessToken & { user: User, session: Session }>({
            model: "oauthAccessToken",
            where: [
                { field: "userId", value: userInfo?.sub || null },
                { field: "expiresAt", operator: "gte", value: new Date() }
            ],
            join: {
                session: true,
                user: true
            }
        });

        if (!oauthToken?.user || !oauthToken?.session) return session

        session = { session: oauthToken.session, user: oauthToken.user }
        ctx.context.session = session

        const cookieConfig = ctx.context.authCookies.sessionToken;
        const cookieName = cookieConfig.name

        await ctx.setSignedCookie(
            cookieName,
            oauthToken.session.token,
            ctx.context.secret,
            cookieConfig.attributes,
        );

        return session
    } catch (_) {
        console.error(_)
        return session
    }
}

export const oauthSessionMiddleware = createAuthMiddleware(async (ctx) => {
    const session = await getOauthSessionFromCtx(ctx);
    if (!session?.session) throw APIError.from("UNAUTHORIZED", {
        message: "Unauthorized",
        code: "UNAUTHORIZED"
    });
    return { session };
});

export const oauthSession = () => {
    return {
        id: "oauth-session",
        init: async (ctx) => {
            const oauthPlugin = ctx.getPlugin("oauth-provider");
            const jwtPlugin = ctx.getPlugin("jwt");
            if (!oauthPlugin || !jwtPlugin) throw new BetterAuthError("oauth-session requires oauth-provider and jwt plugin");
        },
        endpoints: {
            getOAuthSession: createAuthEndpoint(
                "oauth/get-session",
                {
                    method: "GET",
                    query: z.object({
                        fallbackToGetSession: z.boolean()
                    }).default({ fallbackToGetSession: true })
                },
                async (ctx) => {
                    const oauthSession = await getOauthSessionFromCtx(ctx)
                    return !oauthSession && ctx.query.fallbackToGetSession ? await getSessionFromCtx(ctx) : oauthSession
                }
            )
        }
    } satisfies BetterAuthPlugin;
};