import type { RequestHandler } from '@sveltejs/kit'
import { auth } from '$lib/server/auth'
import { Spawner } from '@open-bento/spawner-v3'
import { API_PREFIX } from '$lib/constants'

const handle: RequestHandler = async ({ request }) => {

    console.log(request)

    return new Response()
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle