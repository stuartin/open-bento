import { zSchema, type ContractInputs, type ContractOutputs } from "@open-bento/types"
import { z } from "zod"

export const DummyOrganization: z.infer<typeof zSchema.Organization> = {
    id: "org123456",
    name: "my-organization",
    projects: [],
    createdAt: new Date(),
    updatedAt: new Date()
}

export const organizationsDAO = {
    get: (args: ContractInputs['organizations']['get']): ContractOutputs['organizations']['get'] => {
        return DummyOrganization
    },
    list: (args: ContractInputs['organizations']['list']): ContractOutputs['organizations']['list'] => {
        return {
            results: []
        }
    },
    create: (args: ContractInputs['organizations']['create']): ContractOutputs['organizations']['create'] => {
        return DummyOrganization
    },
    update: (args: ContractInputs['organizations']['update']): ContractOutputs['organizations']['update'] => {
        return DummyOrganization
    },
    delete: (args: ContractInputs['organizations']['delete']): ContractOutputs['organizations']['delete'] => {
        return undefined
    },
}
