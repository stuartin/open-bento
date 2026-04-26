import { contract } from "@open-bento/types";
import { createRouter } from "../lib/orpc";
import { DummyFolder } from "$lib/server/db/dao/folders.dao";
import { jobsRouter } from "./jobs.router";

const os = createRouter(contract.organizations.projects.folders);
export const foldersRouter = os.router({
    get: os.get.handler(
        () => {
            return DummyFolder
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
            return DummyFolder
        }
    ),
    update: os.update.handler(
        () => {
            return DummyFolder
        }
    ),
    delete: os.delete.handler(
        () => {
            return undefined
        }
    ),
    jobs: jobsRouter
})
