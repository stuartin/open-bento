import { contract, type Workspace } from "@open-bento/types";
import { createRouter } from "../../lib/orpc";
import { useAuth } from "../../middleware/use-auth";

const DUMMY_RES = {
    data: {
        id: "workspace",
        type: "workspaces",
        attributes: {

            name: "test", // required for CREATE
            description: "",
            "terraform-version": "", // Required for UPDATE
            "working-directory": "",
            locked: false,
            "locked-reason": "",
            permissions: {
                "can-queue-run": true // required for PLAN
            },
            "execution-mode": "remote" as const,
            "created-at": new Date().toISOString(),
            "updated-at": new Date().toISOString(),
        }
    }
}

const os = createRouter(contract.tfe.organizations.workspaces).use(useAuth);
export const tfeWorkspacesRouter = os.router({
    get: os.get.handler(async ({ input, context, errors }) => {
        // throw errors.NOT_FOUND()

        context.resHeaders?.set("TFP-API-Version", "2.6")
        return DUMMY_RES
    }),
    create: os.create.handler(async ({ input, context, errors }) => {
        context.resHeaders?.set("TFP-API-Version", "2.6")
        return DUMMY_RES
    }),
    update: os.create.handler(async ({ input, context, errors }) => {
        context.resHeaders?.set("TFP-API-Version", "2.6")
        return DUMMY_RES
    }),
    "current-state-version": os["current-state-version"].handler(async ({ input, context }) => {

        context.resHeaders?.set("TFP-API-Version", "2.6")

        return {
            data: {
                id: "state",
                type: "state-versions",
                attributes: {
                    "state-version": 1,
                    "created-at": new Date().toISOString(),
                    "terraform-version": "",
                    modules: {},
                    providers: {},
                    resources: [],
                    serial: 1,
                    status: "finalized"
                }
            }
        }
    })
})
