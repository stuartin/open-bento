import { ProjectSchema, projectsContract } from "./contracts/projects";
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { OpenAPIGenerator } from '@orpc/openapi'

export const contract = {
    projects: projectsContract
}

const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [
        new ZodToJsonSchemaConverter(),
    ],
})

export const schema = await openAPIGenerator.generate(contract, {
    info: {
        title: 'Open Bento',
        version: '0.0.1',
    },
    servers: [
        { url: 'https://api.example.com/v1', },
    ],
    // Hopefully not needed in v2: https://github.com/middleapi/orpc/issues/1423
    commonSchemas: {
        Project: {
            schema: ProjectSchema,
        },
    }
})