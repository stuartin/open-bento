import { contract } from "@open-bento/types";
import { createRouter } from "../lib/orpc";
import { DummyWorkspace } from "$lib/server/db/dao/workspaces.dao";
import { jobsRouter } from "./jobs.router";

const os = createRouter(contract.organizations.projects.workspaces);
export const workspacesRouter = os.router({
    get: os.get.handler(
        () => {
            return DummyWorkspace
        }
    ),
    list: os.list.handler(
        () => {
            return {
                results: []
            }
        }
    ),
    create: os.create.handler(
        () => {
            return DummyWorkspace
        }
    ),
    update: os.update.handler(
        () => {
            return DummyWorkspace
        }
    ),
    delete: os.delete.handler(
        () => {
            return undefined
        }
    ),
    jobs: jobsRouter
})
