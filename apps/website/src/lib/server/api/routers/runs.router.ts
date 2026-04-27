import { contract } from "@open-bento/types";
import { createRouter } from "../lib/orpc";
import { DummyRun, runsDAO } from "$lib/server/db/dao/runs.dao";

const os = createRouter(contract.organizations.projects.workspaces.runs);
export const runsRouter = os.router({
    get: os.get.handler(
        () => {
            return DummyRun
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
        async ({ input, context }) => {
            const run = await runsDAO.create(input)
            await context.spawner.queueRun(run)
            return run
        }
    ),
    update: os.update.handler(
        () => {
            return DummyRun
        }
    ),
    delete: os.delete.handler(
        () => {
            return undefined
        }
    ),
})
