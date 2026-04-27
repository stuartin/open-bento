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
	experimental: {
		joins: true
	},
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		usePlural: true,
	}),
	user: {
		additionalFields: {
			organizationIds: { type: "string[]", defaultValue: () => [] }
		}
	},
	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					const organizations = await db.query.members.findMany({
						where: {
							userId: session.userId
						}
					})

					return {
						data: {
							...session,
							activeOrganizationId: organizations[0]?.id,
						},
					};
				},
			},
		},
	},
	emailAndPassword: {
		enabled: true
	},
	plugins: [
		organization({
			organizationHooks: {
				beforeAddMember: async ({ member, user, organization }) => {
					// Custom validation or modification
					console.log(`Adding ${user.email} to ${organization.name}`);
					// Optionally modify member data
					return {
						data: {
							member,
							organization,
							user: {
								...user,
								organizationIds: [...user.organizationIds, organization.id]
							}
						},
					};
				},
			}
		}),
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
