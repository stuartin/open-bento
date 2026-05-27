import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { CORSPlugin } from '@orpc/server/plugins'
import { onError, ORPCError, ValidationError } from '@orpc/server'
import type { RequestHandler } from '@sveltejs/kit'
import { auth } from '$features/auth/auth'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { ResponseHeadersPlugin } from '@orpc/server/plugins'
import { TFE_ROOT_INTERCEPTOR_CONTEXT_KEY, tfeRootInterceptor } from '$features/tfe/lib/tfe-interceptor'
import { runner } from '$features/runner/runner'
import { env } from '$features/env/env.public'
import { router } from '$features/orpc/router'

const handler = new OpenAPIHandler(
    router,
    {
        plugins: [
            new ResponseHeadersPlugin(),
            new CORSPlugin({
                exposeHeaders: ['Content-Disposition']
            }),
            new OpenAPIReferencePlugin({
                schemaConverters: [
                    new ZodToJsonSchemaConverter()
                ],
                specGenerateOptions: {
                    info: {
                        title: 'Open Bento',
                        version: '0.0.1',
                    },
                    // Hopefully not needed in v2: https://github.com/middleapi/orpc/issues/1423
                    // commonSchemas: {
                    //     Organization: {
                    //         schema: OrganizationSchema,
                    //     },
                    //     Project: {
                    //         schema: ProjectSchema,
                    //     },
                    //     Run: {
                    //         schema: RunSchema,
                    //     },
                    //     Workspace: {
                    //         schema: WorkspaceSchema,
                    //     },
                    // }
                }
            })
        ],
        adapterInterceptors: [
            (options) => {
                return options.next({
                    ...options,
                    context: {
                        ...options.context,
                        // biome-ignore lint/suspicious/noExplicitAny: required
                        [TFE_ROOT_INTERCEPTOR_CONTEXT_KEY as any]: {
                            fetchRequest: options.request,
                        },
                    },
                })
            },
        ],
        rootInterceptors: [
            // https://orpc.dev/docs/advanced/extend-body-parser
            // biome-ignore lint/suspicious/noExplicitAny: required
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
                console.error(error)
            }),
        ],
    })

const handle: RequestHandler = async ({ request }) => {
    console.log({ method: request.method, url: request.url, headers: request.headers })

    // better-auth
    if (request.url.startsWith(`${env.API_PREFIX}/auth`)) auth.handler(request);


    // debug
    if (request.method === "POST" || request.method === "PATCH") {
        const body = await request.clone().json()
        console.log({ ...body })
    }

    // oRPC
    const { response } = await handler.handle(request, {
        prefix: env.API_PREFIX as `/${string}`,
        context: {
            request,
            auth,
            runner
        }
    })

    return response ?? new Response('Not Found', { status: 404 })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle