import { env } from "$env/dynamic/public"

export const DEFAULT_PUBLIC_DATABASE_PATH = "file:local.db"
export const DATABASE_PATH = env.PUBLIC_DATABASE_PATH ?? DEFAULT_PUBLIC_DATABASE_PATH
export const DEFAULT_DATABASE_MIGRATIONS_PATH = "src/lib/server/db/migrations"
export const DATABASE_MIGRATIONS_PATH = env.PUBLIC_DATABASE_MIGRATIONS_PATH ?? DEFAULT_DATABASE_MIGRATIONS_PATH
export const ORIGIN = env.PUBLIC_ORIGIN ?? `http://localhost:5173`
export const ORIGIN_API = `${ORIGIN}/api/v1`