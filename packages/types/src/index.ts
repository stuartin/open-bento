import { ProjectSchema, projectsContract } from "./contracts/projects.contract";
import { JobSchema, jobsContract } from "./contracts/jobs.contract";
import { OrganizationSchema, organizationsContract } from "./contracts/organizations.contract";
import { FolderSchema, foldersContract } from "./contracts/folders.contract";
import { cloudsPingContract } from "./contracts/clouds/clouds.ping.contract";
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { OpenAPIGenerator, type OpenAPIGeneratorGenerateOptions } from '@orpc/openapi'
import type { InferContractRouterInputs, InferContractRouterOutputs } from '@orpc/contract'
import { IdSchema } from "./lib/shared";
import type z from "zod";
import { cloudsOrganizationsContract } from "./contracts/clouds/clouds.organizations.contract";

export const contract = {
    organizations: {
        ...organizationsContract,
        projects: {
            ...projectsContract,
            folders: {
                ...foldersContract,
                jobs: jobsContract
            }
        },
    },
    clouds: {
        ping: cloudsPingContract,
        organizations: cloudsOrganizationsContract
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
        Job: {
            schema: JobSchema,
        },
        Folder: {
            schema: FolderSchema,
        },
    }
}

export const zSchema = {
    Id: IdSchema,
    Organization: OrganizationSchema,
    Project: ProjectSchema,
    Folder: FolderSchema,
    Job: JobSchema,
}

export type Id = z.infer<typeof zSchema.Id>;
export type Organization = z.infer<typeof zSchema.Organization>;
export type Project = z.infer<typeof zSchema.Project>;
export type Folder = z.infer<typeof zSchema.Folder>;
export type Job = z.infer<typeof zSchema.Job>;
export type JobType = z.infer<typeof zSchema.Job.shape.type>;
export type JobStatus = z.infer<typeof zSchema.Job.shape.status>;


export type ContractInputs = InferContractRouterInputs<typeof contract>
export type ContractOutputs = InferContractRouterOutputs<typeof contract>
export type { AnyContractRouter, ContractRouterClient } from "@orpc/contract"