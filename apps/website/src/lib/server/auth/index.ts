import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { createId } from "@paralleldrive/cuid2";
import { building } from '$app/environment';
import { API_PREFIX, ORIGIN, TERRAFORM_CLI_CLIENT_ID } from '$lib/constants';
import { oauthProvider } from "@better-auth/oauth-provider";
import { jwt, organization } from "better-auth/plugins"
import { sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { bearer } from "better-auth/plugins";
import { signedUrl } from '$lib/plugins/signed-url';
import { oauthSession } from '$lib/plugins/oauth-session';

export type Auth = typeof auth
export const auth = betterAuth({
	baseURL: ORIGIN,
	basePath: `${API_PREFIX}/auth`,
	secret: building ? 'is-dev' : env.BETTER_AUTH_SECRET, // https://github.com/better-auth/better-auth/issues/8125
	experimental: {
		joins: true
	},
	disabledPaths: [
		"/token",
	],
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
							activeOrganizationId: organizations[0]?.organizationId,
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
		bearer(),
		organization({
			organizationHooks: {
				afterDeleteOrganization: async ({ organization }) => {
					await db.update(sessions)
						.set({
							activeOrganizationId: null
						})
						.where(eq(sessions.activeOrganizationId, organization.id))
				},
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
		jwt({
			disableSettingJwtHeader: true,
		}),
		oauthProvider({
			consentPage: "/auth/consent",
			loginPage: "/auth/login",
			silenceWarnings: {
				oauthAuthServerConfig: true
			},
			cachedTrustedClients: new Set([
				TERRAFORM_CLI_CLIENT_ID
			])
		}),
		oauthSession(),
		signedUrl({ path: `${ORIGIN}${API_PREFIX}/tfe/uploads` }),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	],
	advanced: {
		database: {
			generateId: () => createId()
		}
	}
});
