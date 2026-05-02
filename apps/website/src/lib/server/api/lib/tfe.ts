import type { StandardOpenAPIHandlerOptions } from "@orpc/openapi/standard";
import type { APIContext } from "..";
import { Readable } from "stream";

type ItemType<T> = T extends Array<infer U> ? U : never;
type RootInterceptors = StandardOpenAPIHandlerOptions<APIContext & { [TFE_ROOT_INTERCEPTOR_CONTEXT_KEY]: { fetchRequest: Request } }>['rootInterceptors']
type RootInterceptor = ItemType<RootInterceptors>

// https://orpc.dev/docs/advanced/extend-body-parser
export const TFE_ROOT_INTERCEPTOR_CONTEXT_KEY = Symbol('TFE_BODY_CONTEXT')
export const tfeRootInterceptor: RootInterceptor = (options) => {
    const { fetchRequest } = (options.context)[TFE_ROOT_INTERCEPTOR_CONTEXT_KEY]

    return options.next({
        ...options,
        request: {
            ...options.request,
            body: async () => {
                const contentDisposition = fetchRequest.headers.get('content-disposition')
                const contentType = fetchRequest.headers.get('content-type')

                if (!contentDisposition && contentType === "application/octet-stream") {
                    return fetchRequest.body
                }

                if (!contentDisposition && contentType === "application/vnd.api+json") {
                    const json = await fetchRequest.text()
                    const parsed = JSON.parse(json)
                    return parsed
                }

                return options.request.body()
            }
        }
    })
}