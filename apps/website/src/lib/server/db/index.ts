import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';
import { relations } from '$lib/server/db/schema/relations';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { projectsDAO } from '$lib/server/db/dao/projects.dao';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!env.MIGRATIONS_PATH) throw new Error('MIGRATIONS_PATH is not set');

const client = createClient({ url: env.DATABASE_URL });
export const db = drizzle({ client, schema, relations, casing: "snake_case" });

export class DB {
    static #instance: DB

    public static async get() {
        if (!DB.#instance) {
            DB.#instance = new DB();
            await DB.#instance.migrate()
        }

        return DB.#instance;
    }

    private async migrate() {
        console.log('DB: Start migrations');
        console.log('DB: Path: ', env.MIGRATIONS_PATH)
        console.log('DB: DB: ', env.DATABASE_URL)

        await migrate(db, {
            migrationsFolder: env.MIGRATIONS_PATH
        });
        console.log('DB: End migrations');
    }

    public PROJECTS = projectsDAO
}