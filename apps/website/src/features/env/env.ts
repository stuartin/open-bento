import z from "zod";

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    ORIGIN: z.string().default("https://localhost:5173"),
    API_PREFIX: z.string().startsWith("/").default("/api/v1")
})

export const env = EnvSchema.parse(import.meta.env);