import { DEFAULT_DATABASE_MIGRATIONS_PATH, DEFAULT_PUBLIC_DATABASE_PATH } from '$lib/constants';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema/index.ts',
	out: DEFAULT_DATABASE_MIGRATIONS_PATH,
	dialect: 'sqlite',
	dbCredentials: { url: DEFAULT_PUBLIC_DATABASE_PATH },
	casing: "snake_case",
	verbose: true,
	strict: true
});
