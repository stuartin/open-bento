import type { JsonifiedClient } from '@orpc/openapi-client'
import { createORPCClient, onError, ORPCError } from '@orpc/client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { QueryClient } from '@tanstack/svelte-query'
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { env } from '$features/env/env'
import type { ContractRouterClient } from '@open-bento/tfe'
import { contract } from './contract'

const link = new OpenAPILink(contract, {
    url: `${env.ORIGIN}${env.API_PREFIX}`,
    fetch: (request, init) => {
        return globalThis.fetch(request, {
            ...init,
            credentials: 'include', // Include cookies for cross-origin requests
        })
    },
    interceptors: [
        onError((error) => {
            if (error instanceof ORPCError) {
                if ([401, 403].includes(error.status)) {
                    goto(`/auth/login?redirectTo=${window.location.pathname}`);
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