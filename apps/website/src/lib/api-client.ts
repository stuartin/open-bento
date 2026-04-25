import type { JsonifiedClient } from '@orpc/openapi-client'
import { createORPCClient, onError, ORPCError } from '@orpc/client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { contract, type ContractRouterClient } from '@open-bento/types'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { QueryClient } from '@tanstack/svelte-query'
import { browser } from '$app/environment'
import { goto } from '$app/navigation'

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
        onError((error, t) => {
            if (error instanceof ORPCError) {
                if ([401, 403].includes(error.status)) {
                    goto(`/demo/better-auth/login?redirectTo=${window.location.pathname}`);
                }
            }
        }),
    ],
})

const orpcClient: JsonifiedClient<ContractRouterClient<typeof contract>> = createORPCClient(link)
export const client = createTanstackQueryUtils(orpcClient)

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            enabled: browser,
            retry: (failureCount, error) => error instanceof ORPCError && [401, 403].includes(error.status) ? false : failureCount < 3
        },
    },
});