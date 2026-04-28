import { zSchema, type ContractInputs, type ContractOutputs } from "@open-bento/types"
import { z } from "zod"

export const DummyWorkspace: z.infer<typeof zSchema.Workspace> = {
    id: "workspace123456",
    organizationId: "org123456",
    projectId: "proj123456",
    name: "my-workspace",
    runs: [],
    createdAt: new Date(),
    updatedAt: new Date()
}

export const workspacesDAO = {
    get: (args: ContractInputs['organizations']['projects']['workspaces']['get']): ContractOutputs['organizations']['projects']['workspaces']['get'] => {
        return DummyWorkspace
    },
    list: (args: ContractInputs['organizations']['projects']['workspaces']['list']): ContractOutputs['organizations']['projects']['workspaces']['list'] => {
        return {
            results: []
        }
    },
    create: (args: ContractInputs['organizations']['projects']['workspaces']['create']): ContractOutputs['organizations']['projects']['workspaces']['create'] => {
        return DummyWorkspace
    },
    update: (args: ContractInputs['organizations']['projects']['workspaces']['update']): ContractOutputs['organizations']['projects']['workspaces']['update'] => {
        return DummyWorkspace
    },
    delete: (args: ContractInputs['organizations']['projects']['workspaces']['delete']): ContractOutputs['organizations']['projects']['workspaces']['delete'] => {
        return undefined
    },
}
