import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '$lib/server/db/schema';
import { relations } from '$lib/server/db/schema/relations';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { projectsDAO } from '$lib/server/db/dao/projects.dao';
import { DATABASE_MIGRATIONS_PATH, DATABASE_PATH } from '$lib/constants';

const client = createClient({ url: DATABASE_PATH });
export const db = drizzle({ client, schema, relations, casing: "snake_case" });

export const dbMigrate = async () => {
    console.log('DB: Start migrations');
    console.log('DB: Path: ', DATABASE_MIGRATIONS_PATH)
    console.log('DB: DB: ', DATABASE_PATH)

    await migrate(db, {
        migrationsFolder: DATABASE_MIGRATIONS_PATH
    });
    console.log('DB: End migrations');
}


class DB {
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
        console.log('DB: Path: ', DATABASE_MIGRATIONS_PATH)
        console.log('DB: DB: ', DATABASE_PATH)

        await migrate(db, {
            migrationsFolder: DATABASE_MIGRATIONS_PATH
        });
        console.log('DB: End migrations');
    }

    public PROJECTS = projectsDAO
}