import { createRouterClient } from "@orpc/server";
import { router } from "./router";
import { auth } from "$features/auth/auth"
import { runner } from "$features/runner/runner.server"
import { env } from "$features/env/env.server";
import { env as pubEnv } from "$features/env/env";

export const orcpServerClient = createRouterClient(
    router,
    {
        context: {
            auth,
            runner,
            request: new Request(`${pubEnv.ORIGIN}`, {
                headers: new Headers({
                    "x-server-key": env.AUTH_SECRET
                })
            })
        }
    }
)