import { contract } from "@open-bento/types";
import { createRouter } from "../lib/orpc";
import { DummyJob, jobsDAO } from "$lib/server/db/dao/jobs.dao";

const os = createRouter(contract.organizations.projects.folders.jobs);
export const jobsRouter = os.router({
    get: os.get.handler(
        () => {
            return DummyJob
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
            const job = await jobsDAO.create(input)
            await context.spawner.queueJob(job)
            return job
        }
    ),
    update: os.update.handler(
        () => {
            return DummyJob
        }
    ),
    delete: os.delete.handler(
        () => {
            return undefined
        }
    ),
})
