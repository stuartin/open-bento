import type { Handle, ServerInit } from '@sveltejs/kit';
import { building, dev } from '$app/environment';
import { auth } from '$features/auth/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { sequence } from '@sveltejs/kit/hooks';
import { initDB } from '$features/db';
import { initTerraformClient } from '$features/auth/init/init-terraform-client';
import { initOrganizationWithAdmin } from '$features/auth/init/init-organization';
import { initTFE } from '$features/auth/init/init-tfe';

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
	await initTFE()
};