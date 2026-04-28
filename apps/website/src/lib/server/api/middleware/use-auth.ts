import { UNAUTHORIZED } from "@open-bento/types/errors";
import { createMiddleware } from "../lib/orpc";
import { authClient } from "$lib/auth-client";
import { dev } from "$app/environment";
import { db } from "$lib/server/db";
import type { User } from "$lib/server/auth/types";

const os = createMiddleware();
export const useAuth = os
    .errors({
        UNAUTHORIZED,
    })
    .middleware(async ({ context, next, errors }) => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = dev ? '0' : '1';

        if (context.request.headers.get("Authorization")) {
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
            console.log(user)
            if (!user) {
                throw errors.UNAUTHORIZED();
            }

            return next({
                context: {
                    user,
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
