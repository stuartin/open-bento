import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema/index.ts',
	out: "src/lib/server/db/migrations",
	dialect: 'sqlite',
	dbCredentials: { url: "file:local.db" },
	casing: "snake_case",
	verbose: true,
	strict: true
});
