import z from "zod";
import fs from 'node:fs';
import path from 'node:path';
import "dotenv/config"

const EnvBaseSchema = z.object({
  AUTH_SECRET: z.string().min(36),
})

export const EnvSchema = z.discriminatedUnion("EXEC_ENVIRONMENT", [
  // Local mode requirements
  EnvBaseSchema.extend({
    EXEC_ENVIRONMENT: z.literal("local"),
    EXEC_LOCAL_STORAGE_PATH: z.string().min(1),
  }),

  // Production mode requirements
  EnvBaseSchema.extend({
    EXEC_ENVIRONMENT: z.literal("docker"),
  }),
])

export const env = EnvSchema.parse(process.env);

export const initEnv = async () => {
  if (env.EXEC_ENVIRONMENT === "local" && env.EXEC_LOCAL_STORAGE_PATH) {
    try {
      const targetDir = path.resolve(env.EXEC_LOCAL_STORAGE_PATH);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch (error) {
      throw new Error(`${error}`)
    }
  }
}