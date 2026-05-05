import { contract, zSchema } from "@open-bento/types";
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
    data: [{
        id: "run-event-id",
        type: "run-events",
        attributes: {
            action: "",
            description: "",
            "created-at": new Date().toISOString()
        }
    }]
}

export const DUMMY_RUN_TASK_STAGE = {
    id: "task-stage-id",
    type: "task-stages",
    attributes: {
        status: "pending" as const,
        stage: "pre_plan" as const,
        "status-timestamps": {
            "pending-at": new Date().toISOString(),
            "running-at": new Date().toISOString(),
            "passed-at": new Date().toISOString(),
        },
        "created-at": new Date().toISOString(),
        "updated-at": new Date().toISOString()
    }
}


const os = createRouter(contract.tfe.runs);
export const tfeRunsRouter = os.router({
    get: os.get.handler(async ({ context, input }) => {
        context.resHeaders?.set("TFP-API-Version", "2.6")

        if (input.query?.include === "task_stages") {
            return {
                data: DUMMY_RUN_RES.data,
                included: [
                    DUMMY_RUN_TASK_STAGE
                ]
            }
        }
        return DUMMY_RUN_RES
    }),
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
