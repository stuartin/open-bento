import { zSchema, type ContractInputs, type ContractOutputs } from "@open-bento/types"
import { z } from "zod"

export const DummyFolder: z.infer<typeof zSchema.Folder> = {
    id: "folder123456",
    organizationId: "org123456",
    projectId: "proj123456",
    name: "my-folder",
    jobs: [],
    createdAt: new Date(),
    updatedAt: new Date()
}

export const foldersDAO = {
    get: (args: ContractInputs['organizations']['projects']['folders']['get']): ContractOutputs['organizations']['projects']['folders']['get'] => {
        return DummyFolder
    },
    list: (args: ContractInputs['organizations']['projects']['folders']['list']): ContractOutputs['organizations']['projects']['folders']['list'] => {
        return {
            results: []
        }
    },
    create: (args: ContractInputs['organizations']['projects']['folders']['create']): ContractOutputs['organizations']['projects']['folders']['create'] => {
        return DummyFolder
    },
    update: (args: ContractInputs['organizations']['projects']['folders']['update']): ContractOutputs['organizations']['projects']['folders']['update'] => {
        return DummyFolder
    },
    delete: (args: ContractInputs['organizations']['projects']['folders']['delete']): ContractOutputs['organizations']['projects']['folders']['delete'] => {
        return undefined
    },
}
