import { contract } from "@open-bento/types";
import { createRouter } from "./lib/orpc";
import { organizationsRouter } from "./routers/organizations.router";
import { projectsRouter } from "./routers/projects.router";
import { foldersRouter } from "./routers/folders.router";
import { jobsRouter } from "./routers/jobs.router";
import type { AuthAPI } from "../auth";
import { useAuth } from "./middleware/use-auth";
import type { Spawner } from "@open-bento/spawner";

export interface APIContext {
    request: Request;
    auth: AuthAPI
    spawner: Spawner
}

const os = createRouter(contract);
export const router = os
    .use(useAuth)
    .router({
        organizations: {
            ...organizationsRouter,
            projects: {
                ...projectsRouter,
                folders: {
                    ...foldersRouter,
                    jobs: jobsRouter
                }
            }
        }
    });