import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/features/db/schema/index.ts',
	out: "src/features/db/migrations",
	dialect: 'sqlite',
	dbCredentials: { url: "file:local.db" },
	casing: "snake_case",
	verbose: true,
	strict: true
});
