import { contract } from "@open-bento/types";
import { createRouter } from "./lib/orpc.router";
import { projectsRouter } from "./routers/projects.router";

export interface APIContext {
    request: Request;
}

const os = createRouter(contract);
export const router = os.router({
    organizations: {
        projects: projectsRouter
    }
});