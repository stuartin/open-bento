import { env } from "$env/dynamic/public"

export const API_PREFIX = '/api/v1'
export const DATABASE_PATH = env.PUBLIC_DATABASE_PATH ?? "file:local.db"
export const DATABASE_MIGRATIONS_PATH = env.PUBLIC_DATABASE_MIGRATIONS_PATH ?? "src/lib/server/db/migrations"
export const ORIGIN = env.PUBLIC_ORIGIN ?? `https://localhost:5173`
export const ORIGIN_API = `${ORIGIN}/api/v1`