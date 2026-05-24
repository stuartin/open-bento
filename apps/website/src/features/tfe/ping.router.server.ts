import { createRouter } from "$features/orpc/factories";
import { tfeContract } from "@open-bento/tfe";

const os = createRouter(tfeContract.ping)
export const tfePingRouter = os
    .router({
        ping: os.ping.handler(async () => {
            return {
                status: 204,
                body: undefined
            }
        })
    })
