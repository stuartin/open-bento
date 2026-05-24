import { createMiddleware } from "$features/orpc/factories"

export const tfeResponse = createMiddleware()
    .middleware(async ({ context, next }) => {
        context.resHeaders?.set("TFP-API-Version", "2.6")
        return await next()
    })