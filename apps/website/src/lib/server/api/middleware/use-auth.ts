import { UNAUTHORIZED } from "@open-bento/types/errors";
import { createMiddleware } from "../lib/orpc";
import { dev } from "$app/environment";
import { db } from "$lib/server/db";
import type { Session, User } from "$lib/server/auth/types";

const os = createMiddleware();
export const useAuth = os
    .errors({
        UNAUTHORIZED,
    })
    .middleware(async ({ context, next, errors }) => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = dev ? '0' : '1';

        const authorizationHeader = context.request.headers.get("Authorization")
        if (authorizationHeader) {
            try {
                const userInfo = await context.auth.api.oauth2UserInfo({
                    headers: context.request.headers
                })

                const accessToken = await db.query.oauthAccessTokens.findFirst({
                    where: {
                        userId: userInfo.sub,
                        expiresAt: { gte: new Date() }
                    },
                    with: {
                        users: true,
                        sessions: true
                    }
                })
                const user = accessToken?.users as User | undefined
                const session = accessToken?.sessions as Session | undefined

                if (!user || !session) throw errors.UNAUTHORIZED();

                return next({
                    context: {
                        user,
                        session
                    },
                });
            } catch (error) {
                console.error(error)
                throw errors.UNAUTHORIZED();
            }
        }

        const session = await context.auth.api.getSession({
            headers: context.request.headers,
        });

        if (!session?.user || !session?.session) throw errors.UNAUTHORIZED();

        return next({
            context: {
                user: session.user,
                session: session.session,
            },
        });
    });
