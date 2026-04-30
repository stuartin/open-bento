import { contract, type Workspace } from "@open-bento/types";
import { createRouter } from "../../lib/orpc";
import { useAuth } from "../../middleware/use-auth";
import { generateRandomString } from "better-auth/crypto";

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

        const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

        const t = await context.auth.$context
        const y = t.internalAdapter.createVerificationValue({
            value: generateRandomString(10, "a-z", "A-Z", "0-9"),
            identifier: `pre-signed:${context.session.token}`,
            expiresAt,
        })
        console.log({ y })
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
    getCurrentStateVersion: os.getCurrentStateVersion.handler(async ({ input, context }) => {

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
