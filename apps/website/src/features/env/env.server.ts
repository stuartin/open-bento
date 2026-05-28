import z from "zod";
import fs from 'node:fs';
import path from 'node:path';
import "dotenv/config"
import { ENVIRONMENTS } from "@open-bento/runner/types";

const EnvBaseSchema = z.object({
  AUTH_SECRET: z.string().min(36),
  DATABASE_PATH: z.string().default("file:local.db"),
  DATABASE_MIGRATIONS_PATH: z.string().default("src/features/db/migrations"),
})

const EnvRunnerSchema = z.discriminatedUnion("RUNNER_ENV", [
  // local
  z.object({
    RUNNER_ENV: z.literal(ENVIRONMENTS.LOCAL),
    RUNNER_LOCAL_PATH: z.string().min(1)
  }),

  // docker
  z.object({
    RUNNER_ENV: z.literal(ENVIRONMENTS.DOCKER),
    RUNNER_DOCKER_IMAGE: z.string().min(1)
  }),
])

export const EnvStorageSchema = z.discriminatedUnion("STORAGE_ENV", [
  // local
  z.object({
    STORAGE_ENV: z.literal("local"),
    STORAGE_PATH: z.string().min(1),
  }),

  // s3
  z.object({
    STORAGE_ENV: z.literal("s3"),
    STORAGE_PATH: z.string().min(1),
  }),
])

const EnvSchema = EnvBaseSchema.and(EnvRunnerSchema).and(EnvStorageSchema)

export const env = EnvSchema.parse(process.env);

export const initEnv = async () => {
  if (env.STORAGE_ENV === "local") {
    try {
      const targetDir = path.resolve(env.STORAGE_PATH);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch (error) {
      throw new Error(`${error}`)
    }
  }
}