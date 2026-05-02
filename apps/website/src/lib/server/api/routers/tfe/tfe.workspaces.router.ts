import { contract } from "@open-bento/types";
import { createRouter } from "../../lib/orpc";
import { useAuth } from "../../middleware/use-auth";
import { ORIGIN } from "$lib/constants";

const DUMMY_WORKSPACE_RES = {
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

export const DUMMY_CONFIGURATION_RES = {
    data: {
        id: "configversion",
        type: "configuration-versions",
        attributes: {
            "auto-queue-runs": true,
            error: null,
            "error-message": null,
            source: "tfe-api",
            speculative: true,
            status: "pending" as const,
            "upload-url":
                "https://localhost:5173/api/v1/tfe/upload",
            provisional: false
        }
    }
}

const osOrg = createRouter(contract.tfe.organizations.workspaces).use(useAuth);
export const tfeOrganizationsWorkspacesRouter = osOrg.router({
    get: osOrg.get.handler(async ({ input, context, errors }) => {
        // throw errors.NOT_FOUND()
        context.resHeaders?.set("TFP-API-Version", "2.6")
        return DUMMY_WORKSPACE_RES
    }),
    create: osOrg.create.handler(async ({ input, context, errors }) => {
        context.resHeaders?.set("TFP-API-Version", "2.6")
        return DUMMY_WORKSPACE_RES
    }),
    update: osOrg.create.handler(async ({ input, context, errors }) => {
        context.resHeaders?.set("TFP-API-Version", "2.6")
        return DUMMY_WORKSPACE_RES
    }),
    getCurrentStateVersion: osOrg.getCurrentStateVersion.handler(async ({ input, context }) => {

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

const osWrk = createRouter(contract.tfe.workspaces).use(useAuth);
export const tfeWorkspacesRouter = osWrk.router({
    createConfigurationVersions: osWrk.createConfigurationVersions.handler(async ({ input, context, errors }) => {
        context.resHeaders?.set("TFP-API-Version", "2.6")
        const { url } = await context.auth.api.generateSignedUrl({
            headers: context.request.headers,
            body: { identifier: DUMMY_CONFIGURATION_RES.data.id }
        })

        return {
            data: {
                ...DUMMY_CONFIGURATION_RES.data,
                attributes: {
                    ...DUMMY_CONFIGURATION_RES.data.attributes,
                    "upload-url": url
                }

            }
        }
    }),
})
