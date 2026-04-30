import type { Handle, ServerInit } from '@sveltejs/kit';
import { building, dev } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { sequence } from '@sveltejs/kit/hooks';
import { initDB } from '$lib/server/db';
import { Spawner } from '@open-bento/spawner-v3';
import { runsDAO } from '$lib/server/db/dao/runs.dao';
import { initTerraformClient } from '$lib/server/auth/init/init-terraform-client';
import { initOrganizationWithAdmin } from '$lib/server/auth/init/init-organization';

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
	await initDB()
	await initTerraformClient()
	await initOrganizationWithAdmin()

	const spawner = await Spawner.get()
	spawner.config = {
		onLogs: runsDAO.onLogs,
		onStatusUpdate: runsDAO.onStatusUpdate
	}
	spawner.start()

};