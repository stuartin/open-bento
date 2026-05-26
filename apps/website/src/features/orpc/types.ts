import type { Runner } from "@open-bento/runner";
import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import type { Auth } from "$features/auth/types";

export type APIContext = {
    request: Request;
    auth: Auth
    runner: Runner
} & ResponseHeadersPluginContext