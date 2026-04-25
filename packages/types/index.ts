import { ProjectSchema, projectsContract } from "./contracts/projects.contract";
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { OpenAPIGenerator, type OpenAPIGeneratorGenerateOptions } from '@orpc/openapi'
import type { InferContractRouterInputs, InferContractRouterOutputs } from '@orpc/contract'

export const contract = {
    organizations: {
        projects: projectsContract
    }
}

const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [
        new ZodToJsonSchemaConverter(),
    ],
})

export const openAPISchemaGeneratorOptions: OpenAPIGeneratorGenerateOptions = {
    info: {
        title: 'Open Bento',
        version: '0.0.1',
    },
    // Hopefully not needed in v2: https://github.com/middleapi/orpc/issues/1423
    commonSchemas: {
        Project: {
            schema: ProjectSchema,
        },
    }
}

export const zSchema = {
    Project: ProjectSchema
}

export type ContractInputs = InferContractRouterInputs<typeof contract>
export type ContractOutputs = InferContractRouterOutputs<typeof contract>
export type { AnyContractRouter, ContractRouterClient } from "@orpc/contract"