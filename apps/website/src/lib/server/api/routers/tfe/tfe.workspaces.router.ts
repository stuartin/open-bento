import { contract } from "@open-bento/types";
import { createRouter } from "../../lib/orpc";
import { db } from "$lib/server/db";
import { useAuth } from "../../middleware/use-auth";
import { readFile } from "fs/promises";
import z from "zod";
import { ORPCError } from "@orpc/client";

const os = createRouter(contract.tfe.organizations.workspaces).use(useAuth);
export const tfeWorkspacesRouter = os.router({
    get: os.get.handler(async ({ input, context, errors }) => {

        context.resHeaders?.set("TFP-API-Version", "2.6")

        // throw errors.NOT_FOUND()

        const res = {
            data: {
                id: "workspace",
                type: "workspaces",
                attributes: {
                    name: input.workspace,
                    description: "",
                    "terraform-version": "",
                    "working-directory": "",
                    locked: false,
                    "locked-reason": "",
                    // permissions: {},
                    "execution-mode": "remote" as const,
                    "created-at": new Date().toISOString(),
                    "updated-at": new Date().toISOString(),
                }
            }
        }

        return res
    }),
    create: os.create.handler(async ({ input, context, errors }) => {
        const res = {
            data: {
                id: "workspace",
                type: "workspaces",
                attributes: {
                    name: input.data.attributes.name,
                    description: "",
                    "terraform-version": "",
                    "working-directory": "",
                    locked: false,
                    "locked-reason": "",
                    // permissions: {},
                    "execution-mode": "remote" as const,
                    "created-at": new Date().toISOString(),
                    "updated-at": new Date().toISOString(),
                }
            }
        }

        context.resHeaders?.set("TFP-API-Version", "2.6")
        return res
    }),
    update: os.create.handler(async ({ input, context, errors }) => {
        const res = {
            data: {
                id: "workspace",
                type: "workspaces",
                attributes: {
                    name: "test",
                    description: "",
                    "terraform-version": "",
                    "working-directory": "",
                    locked: false,
                    "locked-reason": "",
                    // permissions: {},
                    "execution-mode": "remote" as const,
                    "created-at": new Date().toISOString(),
                    "updated-at": new Date().toISOString(),
                }
            }
        }

        context.resHeaders?.set("TFP-API-Version", "2.6")
        return res
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
