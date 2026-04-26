import type { Handle, ServerInit } from '@sveltejs/kit';
import { building } from '$app/environment';
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
};
