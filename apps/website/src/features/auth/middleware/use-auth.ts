import { createMiddleware } from "$features/orpc/factories";
import type { Session, User } from "../types";
import { UNAUTHORIZED } from "@open-bento/tfe/errors"

const os = createMiddleware();
export const useAuth = os
    .errors({
        UNAUTHORIZED,
    })
    .middleware(async ({ context, next, errors }) => {
        const session = await context.auth.api.getOAuthSession({
            headers: context.request.headers
        })

        if (!session?.user || !session?.session) throw errors.UNAUTHORIZED();

        return next({
            context: {
                user: session.user as User,
                session: session.session as Session,
            },
        });
    });
