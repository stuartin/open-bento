import { APIError, createAuthMiddleware } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { BetterAuthError, parseCookies, type BetterAuthPlugin, type Session, type User } from "better-auth";
import type { } from "@better-auth/oauth-provider";
import { type OAuthAccessToken } from "better-auth/plugins";

export const oauthSession = () => {
    return {
        id: "oauth-session",
        init: async (ctx) => {
            const oauthPlugin = ctx.getPlugin("oauth-provider");
            const jwtPlugin = ctx.getPlugin("jwt");
            if (!oauthPlugin || !jwtPlugin) throw new BetterAuthError("oauth-session plugin requires oauth-provider plugin");


        },
        hooks: {
            before: [{
                matcher: (context) => {
                    const authHeader = context.headers?.get("Authorization");
                    // Only match Bearer tokens, not other auth types
                    return !!authHeader?.startsWith("Bearer ") && context.method === "GET"
                },
                handler: createAuthMiddleware(async (ctx) => {
                    const authHeader = ctx.headers?.get("Authorization");
                    if (!authHeader) return;

                    try {

                        // Validate using the oauth plugin
                        const oauthPlugin = ctx.context?.getPlugin("oauth-provider")
                        if (!oauthPlugin) return

                        const userInfo = await oauthPlugin.endpoints.oauth2UserInfo({
                            ...ctx,
                            method: "GET",
                            asResponse: false,
                        })

                        // if (!userInfo) throw new APIError("UNAUTHORIZED", {
                        //     error_description: "user not found",
                        //     error: "invalid_request"
                        // })

                        const oauthToken = await ctx.context.adapter.findOne<OAuthAccessToken & { user: User, session: Session }>({
                            model: "oauthAccessToken",
                            where: [
                                { field: "userId", value: userInfo.sub },
                                { field: "expiresAt", operator: "gte", value: new Date() }
                            ],
                            join: {
                                session: true,
                                user: true
                            }
                        });

                        console.log({ oauthToken })

                        if (!oauthToken?.user || !oauthToken?.session) return

                        const sessionCookieConfig = ctx.context.authCookies.sessionToken;
                        const cookieName = sessionCookieConfig.name
                        const sessionToken = oauthToken.session.token

                        const setCookie = await ctx.setSignedCookie(
                            cookieName,
                            sessionToken,
                            ctx.context.secret,
                            sessionCookieConfig.attributes,
                        );

                        console.log(setCookie)
                        const [name, value] = setCookie.split("=") as [string, string]
                        ctx.setCookie(name, value)
                        ctx.context.session = { session: oauthToken.session, user: oauthToken.user }
                    } catch (error) {
                        // Log but don't block - let normal auth flow handle unauthorized
                        console.error("[oauth-session] Error validating token:", error);
                    }
                })
            }],
        },
    } satisfies BetterAuthPlugin;
};