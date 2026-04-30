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
import { TFE_ROOT_INTERCEPTOR_CONTEXT_KEY, tfeRootInterceptor } from '$lib/server/api/lib/tfe'

const handler = new OpenAPIHandler(router, {
    plugins: [
        new ResponseHeadersPlugin(),
        new CORSPlugin({
            exposeHeaders: ['Content-Disposition']
        }),
        new OpenAPIReferencePlugin({
            schemaConverters: [
                new ZodToJsonSchemaConverter()
            ],
            specGenerateOptions: openAPISchemaGeneratorOptions
        })
    ],
    adapterInterceptors: [
        (options) => {
            return options.next({
                ...options,
                context: {
                    ...options.context,
                    [TFE_ROOT_INTERCEPTOR_CONTEXT_KEY as any]: {
                        fetchRequest: options.request,
                    },
                },
            })
        },
    ],
    rootInterceptors: [
        // https://orpc.dev/docs/advanced/extend-body-parser
        (options) => tfeRootInterceptor(options as any)
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
    if (request.method === "POST" || request.method === "PATCH") {
        const body = await request.clone().json()
        console.log({ ...body })
    }

    // oRPC
    const { response } = await handler.handle(request, {
        prefix: API_PREFIX,
        context: {
            request,
            auth,
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