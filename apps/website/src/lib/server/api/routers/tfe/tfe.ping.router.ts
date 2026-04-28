import { contract } from "@open-bento/types";
import { createRouter } from "../../lib/orpc";

const os = createRouter(contract.tfe.ping);
export const tfePingRouter = os.router({
    ping: os.ping.handler(async ({ context }) => {
        context.resHeaders?.set("TFP-API-Version", "2.6")
    })
})
