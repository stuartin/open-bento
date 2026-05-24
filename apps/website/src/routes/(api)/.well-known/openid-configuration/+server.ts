import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";
import { auth } from '../../../../features/auth/auth';

export const GET = oauthProviderOpenIdConfigMetadata(auth);