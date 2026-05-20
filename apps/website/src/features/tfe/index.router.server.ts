import { createRouter } from "$lib/server/api/lib/orpc";
import { tfeOrganizationsRouter } from "$features/tfe/organization.router.server";
import { tfeContract } from "@open-bento/tfe";
import { tfePingRouter } from "$features/tfe/ping.router.server";
import { tfeWorkspacesRouter } from "./workspace.router.server";
import { tfeStateVersionsRouter } from "./state-version.router.server";

const os = createRouter(tfeContract);
export const tfeRouter = os
    .router({
        ping: tfePingRouter,
        organizations: tfeOrganizationsRouter,
        workspaces: tfeWorkspacesRouter,
        stateVersions: tfeStateVersionsRouter
    });