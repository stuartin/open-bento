import { contract } from "@open-bento/types";
import { createRouter } from "../../lib/orpc";

export const DUMMY_RUN_RES = {
    data: {
        id: "runs-id",
        type: "runs",
        attributes: {
            status: "pending" as const,
            "created-at": new Date().toISOString(),
        }
    }
}

export const DUMMY_RUN_EVENT_RES = {
    id: "run-event-id",
    type: "run-evens",
    attributes: {
        action: "",
        description: "",
        "created-at": new Date()
    }
}


const os = createRouter(contract.tfe.runs);
export const tfeRunsRouter = os.router({
    create: os.create.handler(async ({ context }) => {
        context.resHeaders?.set("TFP-API-Version", "2.6")

        return DUMMY_RUN_RES
    }),
    events: os.events.router({
        get: os.events.get.handler(async ({ context }) => {
            context.resHeaders?.set("TFP-API-Version", "2.6")

            return DUMMY_RUN_EVENT_RES
        }),
    })
})
