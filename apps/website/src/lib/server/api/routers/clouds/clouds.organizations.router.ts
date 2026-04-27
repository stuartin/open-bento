import { contract } from "@open-bento/types";
import { createRouter } from "../../lib/orpc";
import { useAuth } from "../../middleware/use-auth";

const os = createRouter(contract.clouds.organizations);
export const cloudsOrganizationsRouter = os
    .use(useAuth)
    .router({
        entitlementSet: os.entitlementSet.handler(({ input, path }) => {
            console.log({ input, path })
        })
    })
