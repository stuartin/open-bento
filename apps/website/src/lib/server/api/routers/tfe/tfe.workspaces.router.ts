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

        throw errors.NOT_FOUND()

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
        const json = await input.body.text()
        const parsed = JSON.parse(json)
        const { success, data, error } = z.object({
            data: z.object({
                type: z.literal("workspaces"),
                attributes: z.object({
                    name: z.string()
                })
            })
        }).safeParse(parsed)

        if (!success) throw errors.BAD_REQUEST(error)

        const res = {
            data: {
                id: "workspace",
                type: "workspaces",
                attributes: {
                    name: data.data.attributes.name,
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
