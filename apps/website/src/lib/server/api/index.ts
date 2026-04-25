import { contract } from "@open-bento/types";
import { createRouter } from "./lib/orpc";
import { projectsRouter } from "./routers/projects.router";
import type { AuthAPI } from "../auth";
import { useAuth } from "./middleware/use-auth";

export interface APIContext {
    request: Request;
    auth: AuthAPI
}

const os = createRouter(contract);
export const router = os
    .use(useAuth)
    .router({
        organizations: {
            projects: projectsRouter
        }
    });