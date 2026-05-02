import { contract } from "@open-bento/types";
import { useAuth } from "../../middleware/use-auth";
import { DUMMY_CONFIGURATION_RES } from "./tfe.workspaces.router";
import { createRouter } from "../../lib/orpc";

const os = createRouter(contract.tfe.configurationVersions).use(useAuth);
export const tfeConfigurationVersionsRouter = os.router({
    getConfigurationVersion: os.getConfigurationVersion.handler(async ({ input, context, errors }) => {
        context.resHeaders?.set("TFP-API-Version", "2.6")

        return {
            data: {
                ...DUMMY_CONFIGURATION_RES.data,
                attributes: {
                    ...DUMMY_CONFIGURATION_RES.data.attributes,
                    status: "uploaded"
                }

            }
        }
    })
})
