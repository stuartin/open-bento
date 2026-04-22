import { projectsContract } from "./contracts/projects";
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { OpenAPIGenerator } from '@orpc/openapi'

export const contract = {
    projects: projectsContract
}

const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [
        new ZodToJsonSchemaConverter(), // <-- if you use Zod
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
})