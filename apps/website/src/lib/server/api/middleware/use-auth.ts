import { UNAUTHORIZED } from "@open-bento/types/errors";
import { createMiddleware } from "../lib/orpc";

const os = createMiddleware();
export const useAuth = os
    .errors({
        UNAUTHORIZED,
    })
    .middleware(async ({ context, next, errors }) => {
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
