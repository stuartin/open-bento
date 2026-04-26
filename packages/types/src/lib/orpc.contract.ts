import { oc } from '@orpc/contract';
import { UNAUTHORIZED, BAD_REQUEST } from './errors';

export function createContract() {
    return {
        pub: oc.errors({
            BAD_REQUEST
        }),
        auth: oc.errors({
            BAD_REQUEST,
            UNAUTHORIZED,
        }),
    };
}