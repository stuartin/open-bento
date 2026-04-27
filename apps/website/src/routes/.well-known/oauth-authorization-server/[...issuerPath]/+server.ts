import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import { auth } from '../../../../lib/server/auth';

export const GET = oauthProviderAuthServerMetadata(auth);