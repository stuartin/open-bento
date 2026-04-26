import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { CORSPlugin } from '@orpc/server/plugins'
import { onError } from '@orpc/server'
import { router } from '$lib/server/api'
import type { RequestHandler } from '@sveltejs/kit'
import { auth } from '$lib/server/auth'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { openAPISchemaGeneratorOptions } from '@open-bento/types'
import { Spawner } from '@open-bento/spawner-v3'

const handler = new OpenAPIHandler(router, {
    plugins: [
        new CORSPlugin(),
        new OpenAPIReferencePlugin({
            schemaConverters: [
                new ZodToJsonSchemaConverter()
            ],
            specGenerateOptions: openAPISchemaGeneratorOptions
        })
    ],
    interceptors: [
        onError((error) => {
            console.error(error)
        }),
    ],
})

const handle: RequestHandler = async ({ request }) => {
    const { response } = await handler.handle(request, {
        prefix: '/api/v1',
        context: {
            request,
            auth: auth.api,
            spawner: await Spawner.get()
        }
    })

    return response ?? new Response('Not Found', { status: 404 })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle