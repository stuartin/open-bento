import { ProjectSchema, projectsContract } from "./contracts/projects.contract";
import { RunSchema, runsContract } from "./contracts/runs.contract";
import { OrganizationSchema, organizationsContract } from "./contracts/organizations.contract";
import { WorkspaceSchema, workspacesContract } from "./contracts/workspaces.contract";
import { tfePingContract } from "./contracts/tfe/tfe.ping.contract";
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { OpenAPIGenerator, type OpenAPIGeneratorGenerateOptions } from '@orpc/openapi'
import type { InferContractRouterInputs, InferContractRouterOutputs } from '@orpc/contract'
import { IdSchema } from "./lib/shared";
import type z from "zod";
import { tfeOrganizationsContract } from "./contracts/tfe/tfe.organizations.contract";
import { TFEConfigurationVersionSchema, tfeOrganizationsWorkspacesContract, tfeWorkspacesContract } from "./contracts/tfe/tfe.workspaces.contract";
import { toEntityResponseSchema } from "./lib/tfe";
import { tfeUploadsContract } from "./contracts/tfe/tfe.uploads.contract";

export const contract = {
    organizations: {
        ...organizationsContract,
        projects: {
            ...projectsContract,
            workspaces: {
                ...workspacesContract,
                runs: runsContract
            }
        },
    },
    tfe: {
        ping: tfePingContract,
        organizations: {
            ...tfeOrganizationsContract,
            workspaces: tfeOrganizationsWorkspacesContract
        },
        workspaces: tfeWorkspacesContract,
        uploads: tfeUploadsContract
    }
}

const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [
        new ZodToJsonSchemaConverter(),
    ],
})

export const openAPISchemaGeneratorOptions: OpenAPIGeneratorGenerateOptions = {
    info: {
        title: 'Open Bento',
        version: '0.0.1',
    },
    // Hopefully not needed in v2: https://github.com/middleapi/orpc/issues/1423
    commonSchemas: {
        Organization: {
            schema: OrganizationSchema,
        },
        Project: {
            schema: ProjectSchema,
        },
        Run: {
            schema: RunSchema,
        },
        Workspace: {
            schema: WorkspaceSchema,
        },
    }
}

export const zSchema = {
    Id: IdSchema,
    Organization: OrganizationSchema,
    Project: ProjectSchema,
    Workspace: WorkspaceSchema,
    Run: RunSchema,
    TFE: {
        ConfigurationVersion: toEntityResponseSchema("configuration-versions", TFEConfigurationVersionSchema)
    }
}

export type Id = z.infer<typeof zSchema.Id>;
export type Organization = z.infer<typeof zSchema.Organization>;
export type Project = z.infer<typeof zSchema.Project>;
export type Workspace = z.infer<typeof zSchema.Workspace>;
export type Run = z.infer<typeof zSchema.Run>;
export type RunType = z.infer<typeof zSchema.Run.shape.type>;
export type RunStatus = z.infer<typeof zSchema.Run.shape.status>;


export type ContractInputs = InferContractRouterInputs<typeof contract>
export type ContractOutputs = InferContractRouterOutputs<typeof contract>
export type { AnyContractRouter, ContractRouterClient } from "@orpc/contract"