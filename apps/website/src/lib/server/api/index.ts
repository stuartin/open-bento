import { contract } from "@open-bento/types";
import { createRouter } from "./lib/orpc";
import { organizationsRouter } from "./routers/organizations.router";
import { projectsRouter } from "./routers/projects.router";
import { workspacesRouter } from "./routers/workspaces.router";
import { runsRouter } from "./routers/runs.router";
import type { Auth } from "../auth";
import type { Spawner } from "@open-bento/spawner-v3";
import { tfePingRouter } from "./routers/tfe/tfe.ping.router";
import { tfeOrganizationsRouter } from "./routers/tfe/tfe.organizations.router";
import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import { tfeWorkspacesRouter } from "./routers/tfe/tfe.workspaces.router";

export type APIContext = {
    request: Request;
    auth: Auth
    spawner: Spawner
} & ResponseHeadersPluginContext

const os = createRouter(contract);
export const router = os
    .router({
        organizations: {
            ...organizationsRouter,
            projects: {
                ...projectsRouter,
                workspaces: {
                    ...workspacesRouter,
                    runs: runsRouter
                }
            }
        },
        tfe: {
            ping: tfePingRouter,
            organizations: tfeOrganizationsRouter,
            workspaces: tfeWorkspacesRouter
        },
    });