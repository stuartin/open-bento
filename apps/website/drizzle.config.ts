import { env } from '$features/env/env.server';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/features/db/schema/index.ts',
	out: env.DATABASE_MIGRATIONS_PATH,
	dialect: 'sqlite',
	dbCredentials: { url: env.DATABASE_PATH },
	casing: "snake_case",
	verbose: true,
	strict: true
});
