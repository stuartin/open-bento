import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: {
        path: "http://localhost:4000/openapi.json",
        watch: true
    },
    output: 'generated/client',
    plugins: [
        'zod',
        {
            name: "@hey-api/sdk",
            validator: true
        }
    ]
});