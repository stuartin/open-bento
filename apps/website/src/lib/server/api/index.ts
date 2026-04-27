import { contract } from "@open-bento/types";
import { createRouter } from "./lib/orpc";
import { organizationsRouter } from "./routers/organizations.router";
import { projectsRouter } from "./routers/projects.router";
import { workspacesRouter } from "./routers/workspaces.router";
import { runsRouter } from "./routers/runs.router";
import type { AuthAPI } from "../auth";
import type { Spawner } from "@open-bento/spawner-v3";
import { cloudsPingRouter } from "./routers/clouds/clouds.ping.router";
import { cloudsOrganizationsRouter } from "./routers/clouds/clouds.organizations.router";
import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";

export type APIContext = {
    request: Request;
    auth: AuthAPI
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
        clouds: {
            ping: cloudsPingRouter,
            organizations: cloudsOrganizationsRouter
        }
    });