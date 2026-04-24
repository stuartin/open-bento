import { zSchema, type ContractInputs, type ContractOutputs } from "@open-bento/types"
import { z } from "zod"

const DummyProject: z.infer<typeof zSchema.Project> = {
    id: "123456",
    organizationId: "123456",
    name: "my-project"
}

export const projectsDAO = {
    get: (args: ContractInputs['projects']['get']): ContractOutputs['projects']['get'] => {
        return DummyProject
    },
    list: (args: ContractInputs['projects']['list']): ContractOutputs['projects']['list'] => {
        return {
            results: []
        }
    },
    create: (args: ContractInputs['projects']['create']): ContractOutputs['projects']['create'] => {
        return DummyProject

    },
    update: (args: ContractInputs['projects']['update']): ContractOutputs['projects']['update'] => {
        return DummyProject
    },
    delete: (args: ContractInputs['projects']['delete']): ContractOutputs['projects']['delete'] => {
        return undefined
    },
}