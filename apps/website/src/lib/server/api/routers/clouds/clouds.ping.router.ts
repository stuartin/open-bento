import { contract } from "@open-bento/types";
import { createRouter } from "../../lib/orpc";

const os = createRouter(contract.clouds.ping);
export const cloudsPingRouter = os.router({
    ping: os.ping.handler(async ({ input, path }) => {
        return { ok: true }
    })
})
