import type { APIClient } from '$lib/api-client';
import type { Session, User } from 'better-auth'

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
		}

		// interface Error {}
		interface PageData {
			user?: User;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
