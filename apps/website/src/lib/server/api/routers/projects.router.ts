import { contract } from "@open-bento/types";
import { createRouter } from "../lib/orpc";
import { DummyProject } from "$lib/server/db/dao/projects.dao";
import { foldersRouter } from "./folders.router";

const os = createRouter(contract.organizations.projects);
export const projectsRouter = os.router({
    get: os.get.handler(
        () => {
            return DummyProject
        }
    ),
    list: os.list.handler(
        ({ input }) => {
            console.log('projects.list')
            return {
                results: [{
                    id: "123",
                    organizationId: input.organizationId,
                    name: "123",
                    folders: []
                }]
            }
        }
    ),
    create: os.create.handler(
        () => {
            return DummyProject
        }
    ),
    update: os.update.handler(
        () => {
            return DummyProject
        }
    ),
    delete: os.delete.handler(
        () => {
            return undefined
        }
    ),
    folders: foldersRouter
})
