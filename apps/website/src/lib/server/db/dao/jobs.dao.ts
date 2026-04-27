import { zSchema, type ContractInputs, type ContractOutputs, type JobStatus } from "@open-bento/types"
import { z } from "zod"

export const DummyJob: z.infer<typeof zSchema.Job> = {
    id: "job123456",
    organizationId: "org123456",
    projectId: "proj123456",
    workspaceId: "workspace123456",
    tool: "tofu",
    toolVersion: "1.9.1",
    type: "plan",
    status: "pending",
    logs: "",
    createdAt: new Date(),
    updatedAt: new Date()
}


const onStatusUpdate = async (jobId: string, status: JobStatus) => {
    console.log('onStatusUpdate', jobId, status)
    const job = await get(jobId)
    job.status = status
    await jobsDAO.update(job)
}

const onLogs = async (jobId: string, logs: string[]) => {
    console.log(jobId, logs)
}

const get = async (jobId: z.infer<typeof zSchema.Id>): Promise<ContractOutputs['organizations']['projects']['workspaces']['jobs']['get']> => {
    return DummyJob
}

const list = async (args: ContractInputs['organizations']['projects']['workspaces']['jobs']['list']): Promise<ContractOutputs['organizations']['projects']['workspaces']['jobs']['list']> => {
    return {
        results: []
    }
}

const create = async (args: ContractInputs['organizations']['projects']['workspaces']['jobs']['create']): Promise<ContractOutputs['organizations']['projects']['workspaces']['jobs']['create']> => {
    return DummyJob
}

type UpdateJobType = Omit<ContractInputs['organizations']['projects']['workspaces']['jobs']['update'], "jobId"> & { id: z.infer<typeof zSchema.Id> }
const update = async (args: UpdateJobType): Promise<ContractOutputs['organizations']['projects']['workspaces']['jobs']['update']> => {
    return DummyJob
}

const del = async (args: ContractInputs['organizations']['projects']['workspaces']['jobs']['delete']): Promise<ContractOutputs['organizations']['projects']['workspaces']['jobs']['delete']> => {
    return undefined
}

export const jobsDAO = {
    get,
    list,
    create,
    update,
    delete: del,
    onLogs,
    onStatusUpdate,
}
