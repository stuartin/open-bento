import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { CORSPlugin } from '@orpc/server/plugins'
import { onError, ORPCError, ValidationError } from '@orpc/server'
import { router } from '$lib/server/api'
import type { RequestHandler } from '@sveltejs/kit'
import { auth } from '$lib/server/auth'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { openAPISchemaGeneratorOptions } from '@open-bento/types'
import { Spawner } from '@open-bento/spawner-v3'
import { API_PREFIX } from '$lib/constants'
import { ResponseHeadersPlugin } from '@orpc/server/plugins'

const handler = new OpenAPIHandler(router, {
    plugins: [
        new ResponseHeadersPlugin(),
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

            if (error instanceof ORPCError) {
                console.error(error.message)
                if (error.cause instanceof ValidationError) {
                    console.log(JSON.stringify(error, null, 2))
                }
            }
        }),
    ],
})

const handle: RequestHandler = async ({ request }) => {
    console.log({ method: request.method, url: request.url })

    // better-auth
    if (request.url.startsWith(`${API_PREFIX}/auth`)) auth.handler(request);


    // debug
    if (request.method === "POST") {
        const body = await request.clone().json()
        console.log({ ...body })
    }

    // oRPC
    const { response } = await handler.handle(request, {
        prefix: API_PREFIX,
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