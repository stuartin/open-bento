import { contract } from "@open-bento/types";
import { createRouter } from "../lib/orpc";
import { DummyOrganization } from "$lib/server/db/dao/organizations.dao";
import { projectsRouter } from "./projects.router";
import { useAuth } from "../middleware/use-auth";

const os = createRouter(contract.organizations);
export const organizationsRouter = os
    .use(useAuth)
    .router({
        get: os.get.handler(
            () => {
                return DummyOrganization
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
                return DummyOrganization
            }
        ),
        update: os.update.handler(
            () => {
                return DummyOrganization
            }
        ),
        delete: os.delete.handler(
            () => {
                return undefined
            }
        ),
        projects: projectsRouter
    })
