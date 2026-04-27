import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { createId } from "@paralleldrive/cuid2";
import { building } from '$app/environment';
import { API_PREFIX, ORIGIN } from '$lib/constants';
import { oauthProvider } from "@better-auth/oauth-provider";
import { jwt, organization } from "better-auth/plugins"

export type AuthAPI = typeof auth['api']
export const auth = betterAuth({
	baseURL: ORIGIN,
	basePath: `${API_PREFIX}/auth`,
	secret: building ? 'is-dev' : env.BETTER_AUTH_SECRET, // https://github.com/better-auth/better-auth/issues/8125
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		usePlural: true,
	}),
	emailAndPassword: { enabled: true },
	plugins: [
		organization(),
		jwt(),
		oauthProvider({
			consentPage: "/auth/consent",
			loginPage: "/auth/login",
			silenceWarnings: {
				oauthAuthServerConfig: true
			},
			cachedTrustedClients: new Set([
				"terraform-cli"
			])
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	],
	advanced: {
		database: {
			generateId: () => createId()
		}
	}
});
