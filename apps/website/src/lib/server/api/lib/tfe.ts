import type { StandardOpenAPIHandlerOptions } from "@orpc/openapi/standard";
import type { APIContext } from "..";

type ItemType<T> = T extends Array<infer U> ? U : never;
type RootInterceptors = StandardOpenAPIHandlerOptions<APIContext & { [TFE_ROOT_INTERCEPTOR_CONTEXT_KEY]: { fetchRequest: Request } }>['rootInterceptors']
type RootInterceptor = ItemType<RootInterceptors>

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

                if (!contentDisposition && contentType == "application/octet-stream") {
                    // how to create a File here?
                    //
                    // example incoming request:
                    // headers: Headers {
                    // 'user-agent': 'go-tfe',
                    // 'terraform-version': '1.7.3',
                    // 'x-terraform-integration': 'cloud',
                    // accept: 'application/json, */*',
                    // 'content-type': 'application/octet-stream',
                    // 'content-length': '3865',
                    // 'accept-encoding': 'gzip',
                    // host: 'localhost:5173'
                    //   }

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