import { zSchema, type ContractInputs, type ContractOutputs, type RunStatus } from "@open-bento/types"
import { z } from "zod"

export const DummyRun: z.infer<typeof zSchema.Run> = {
    id: "run123456",
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


const onStatusUpdate = async (runId: string, status: RunStatus) => {
    console.log('onStatusUpdate', runId, status)
    const run = await get(runId)
    run.status = status
    await runsDAO.update(run)
}

const onLogs = async (runId: string, logs: string[]) => {
    console.log(runId, logs)
}

const get = async (runId: z.infer<typeof zSchema.Id>): Promise<ContractOutputs['organizations']['projects']['workspaces']['runs']['get']> => {
    return DummyRun
}

const list = async (args: ContractInputs['organizations']['projects']['workspaces']['runs']['list']): Promise<ContractOutputs['organizations']['projects']['workspaces']['runs']['list']> => {
    return {
        results: []
    }
}

const create = async (args: ContractInputs['organizations']['projects']['workspaces']['runs']['create']): Promise<ContractOutputs['organizations']['projects']['workspaces']['runs']['create']> => {
    return DummyRun
}

type UpdateRunType = Omit<ContractInputs['organizations']['projects']['workspaces']['runs']['update'], "runId"> & { id: z.infer<typeof zSchema.Id> }
const update = async (args: UpdateRunType): Promise<ContractOutputs['organizations']['projects']['workspaces']['runs']['update']> => {
    return DummyRun
}

const del = async (args: ContractInputs['organizations']['projects']['workspaces']['runs']['delete']): Promise<ContractOutputs['organizations']['projects']['workspaces']['runs']['delete']> => {
    return undefined
}

export const runsDAO = {
    get,
    list,
    create,
    update,
    delete: del,
    onLogs,
    onStatusUpdate,
}
