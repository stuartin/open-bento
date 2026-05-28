import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$features/db';
import { createId } from "@paralleldrive/cuid2";
import { TERRAFORM_CLI_CLIENT_ID } from '$lib/constants';
import { oauthProvider } from "@better-auth/oauth-provider";
import { jwt, organization } from "better-auth/plugins"
import { sessions } from '$features/db/schema';
import { eq } from 'drizzle-orm';
import { bearer } from "better-auth/plugins";
import { signedUrl } from './plugins/signed-url.server';
import { oauthSession } from './plugins/oauth-session.server';
import { env } from '$features/env/env';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	basePath: `${env.API_PREFIX}/auth`,
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
		signedUrl(),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	],
	advanced: {
		database: {
			generateId: () => createId()
		}
	}
});
