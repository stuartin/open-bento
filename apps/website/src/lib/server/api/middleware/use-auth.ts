import { UNAUTHORIZED } from "@open-bento/types/errors";
import { createMiddleware } from "../lib/orpc";
import { authClient } from "$lib/auth-client";
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
            const { data } = await authClient.oauth2.userinfo({
                fetchOptions: {
                    headers: context.request.headers
                }
            })

            const user = await db.query.users.findFirst({
                where: {
                    id: data?.sub
                }
            }) as User | undefined

            const session = await db.query.sessions.findFirst({
                where: {
                    userId: user?.id
                }
            }) as Session | undefined

            if (!user) throw errors.UNAUTHORIZED();

            return next({
                context: {
                    user,
                    session
                },
            });
        }

        const authSession = await context.auth.getSession({
            headers: context.request.headers,
        });
        if (!authSession?.user) {
            throw errors.UNAUTHORIZED();
        }

        return next({
            context: {
                session: authSession.session,
                user: authSession.user,
            },
        });
    });
