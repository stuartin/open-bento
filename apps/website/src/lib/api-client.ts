import type { JsonifiedClient } from '@orpc/openapi-client'
import { createORPCClient, onError } from '@orpc/client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { contract, type ContractRouterClient } from '@open-bento/types'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

const link = new OpenAPILink(contract, {
    url: 'http://localhost:5173/api/v1',
    headers: () => ({
        'x-api-key': 'my-api-key',
    }),
    fetch: (request, init) => {
        return globalThis.fetch(request, {
            ...init,
            credentials: 'include', // Include cookies for cross-origin requests
        })
    },
    interceptors: [
        onError((error: any) => {
            console.error(error)
        })
    ],
})

const orpcClient: JsonifiedClient<ContractRouterClient<typeof contract>> = createORPCClient(link)
export const client = createTanstackQueryUtils(orpcClient)