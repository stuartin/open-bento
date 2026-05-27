import { implement, os } from '@orpc/server';
import type { APIContext } from "./types";
import type { AnyContractRouter } from '@open-bento/tfe';

export function createRouter<T extends AnyContractRouter>(contract: T) {
    return implement<typeof contract>(contract)
        .$context<APIContext>();
}

export function createMiddleware() {
    return os.$context<APIContext>();
}