import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { relations } from './schema/relations';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { env } from '$features/env/env.public';

const client = createClient({ url: env.DATABASE_PATH });
export const db = drizzle({ client, schema, relations, casing: "snake_case" });

export const initDB = async () => {
    console.log('DB: Start migrations');
    console.log('DB: Path: ', env.DATABASE_MIGRATIONS_PATH)
    console.log('DB: DB: ', env.DATABASE_PATH)

    await migrate(db, {
        migrationsFolder: env.DATABASE_MIGRATIONS_PATH
    });
    console.log('DB: End migrations');
}
