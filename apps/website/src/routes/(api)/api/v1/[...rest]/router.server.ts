import { createRouter } from "$lib/server/api/lib/orpc";
import type { Spawner } from "@open-bento/spawner-v3";
import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import type { Auth } from "better-auth";
import { tfeOrganizationsRouter } from "$features/tfe/organization.router.server";
import { tfeContract } from "@open-bento/tfe";
import { tfePingRouter } from "$features/tfe/ping.router.server";

export type APIContext = {
    request: Request;
    auth: Auth
    spawner: Spawner
} & ResponseHeadersPluginContext

const os = createRouter({ tfe: tfeContract });
export const router = os
    .router({
        tfe: {
            ping: tfePingRouter,
            organizations: tfeOrganizationsRouter
        }
    });