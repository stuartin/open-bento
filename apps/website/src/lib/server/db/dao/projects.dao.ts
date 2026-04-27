import { zSchema, type ContractInputs, type ContractOutputs } from "@open-bento/types"
import { z } from "zod"

export const DummyProject: z.infer<typeof zSchema.Project> = {
    id: "123456",
    organizationId: "123456",
    name: "my-project",
    workspaces: []
}

export const projectsDAO = {
    get: (args: ContractInputs['organizations']['projects']['get']): ContractOutputs['organizations']['projects']['get'] => {
        return DummyProject
    },
    list: (args: ContractInputs['organizations']['projects']['list']): ContractOutputs['organizations']['projects']['list'] => {
        return {
            results: []
        }
    },
    create: (args: ContractInputs['organizations']['projects']['create']): ContractOutputs['organizations']['projects']['create'] => {
        return DummyProject

    },
    update: (args: ContractInputs['organizations']['projects']['update']): ContractOutputs['organizations']['projects']['update'] => {
        return DummyProject
    },
    delete: (args: ContractInputs['organizations']['projects']['delete']): ContractOutputs['organizations']['projects']['delete'] => {
        return undefined
    },
}