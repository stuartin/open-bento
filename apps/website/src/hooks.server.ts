import type { Handle, ServerInit } from '@sveltejs/kit';
import { building, dev } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { sequence } from '@sveltejs/kit/hooks';
import { DB } from '$lib/server/db';
import { Spawner } from '@open-bento/spawner-v3';
import { jobsDAO } from '$lib/server/db/dao/jobs.dao';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(handleBetterAuth);

export const init: ServerInit = async () => {
	await DB.get()
	const spawner = await Spawner.get()
	spawner.config = {
		onLogs: jobsDAO.onLogs,
		onStatusUpdate: jobsDAO.onStatusUpdate
	}
	spawner.start()

	await terraformOAuthClient()
};

const terraformOAuthClient = async () => {
	const context = await auth.$context
	const adapter = context.adapter

	if (dev) {
		await adapter.delete({
			model: "oauthClient",
			where: [{ field: "clientId", value: "terraform-cli" }]
		})
	}

	const existing = await adapter.findOne<{ id: string }>({
		model: "oauthClient",
		where: [{ field: "clientId", value: "terraform-cli" }],
	})

	if (existing) {
		return { id: existing.id, action: "found" }
	}

	const terraformClient = await adapter.create({
		model: "oauthClient",
		data: {
			clientId: "terraform-cli",
			name: "terraform-cli",
			redirectUris: [
				"http://localhost:10000/login",
				"http://localhost:10001/login",
				"http://localhost:10002/login",
				"http://localhost:10003/login",
				"http://localhost:10004/login",
				"http://localhost:10005/login",
				"http://localhost:10006/login",
				"http://localhost:10007/login",
				"http://localhost:10008/login",
				"http://localhost:10009/login",
				"http://localhost:10010/login",
			],
			skipConsent: true,
			public: true,
			tokenEndpointAuthMethod: "none",
			responseTypes: [
				"code"
			],
			grantTypes: [
				"authorization_code"
			],
			scopes: [
				"openid",
				"profile",
				"email",
				"offline_access",
			],
			createdAt: new Date(),
			updatedAt: new Date()
		},
	})

	return { id: terraformClient.id, action: "created" }
}
