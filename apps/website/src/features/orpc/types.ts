import type { Spawner } from "@open-bento/spawner-v3";
import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import type { Auth } from "$features/auth/types";

export type APIContext = {
    request: Request;
    auth: Auth
    spawner: Spawner
} & ResponseHeadersPluginContext