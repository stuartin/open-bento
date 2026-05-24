import { createRouter } from "$features/orpc/factories";
import { tfeOrganizationsRouter } from "./organization.router.server";
import { tfeContract } from "@open-bento/tfe";
import { tfePingRouter } from "./ping.router.server";
import { tfeWorkspacesRouter } from "./workspace.router.server";
import { tfeStateVersionsRouter } from "./state-version.router.server";
import { tfeResponse } from "./lib/tfe-response.middleware";
import { tfeConfigurationVersionsRouter } from "./configuration-version.router.server";
import { tfeUploadsRouter } from "./upload.router.server";
import { tfeRunsRouter } from "./run.router.server";
import { tfePlansRouter } from "./plan.router.server";
import { tfeReadLogsRouter } from "./read-log.router.server";

const os = createRouter(tfeContract);
export const tfeRouter = os
    .use(tfeResponse)
    .router({
        ping: tfePingRouter,
        organizations: tfeOrganizationsRouter,
        workspaces: tfeWorkspacesRouter,
        stateVersions: tfeStateVersionsRouter,
        configurationVersions: tfeConfigurationVersionsRouter,
        uploads: tfeUploadsRouter,
        runs: tfeRunsRouter,
        plans: tfePlansRouter,
        readLogs: tfeReadLogsRouter
    });