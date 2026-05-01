import { createAuthEndpoint, createAuthMiddleware, requestOnlySessionMiddleware, sessionMiddleware } from "better-auth/api";
import { z } from "zod";
import type { BetterAuthClientPlugin, BetterAuthPlugin } from "better-auth";
import { generateRandomString } from "better-auth/crypto";
import { createHMAC } from "@better-auth/utils/hmac";

export interface PreSignedUrlOptions {
    path: string; // The path to sign
    expiresIn?: number; // Expiration in seconds (default: 900 = 15 min)
}

export const signedUrl = (options: PreSignedUrlOptions) => {
    const path = options.path;
    const expiresIn = options.expiresIn ?? 900;

    return {
        id: "signed-url",
        endpoints: {
            generateSignedUrl: createAuthEndpoint(
                "/signed-url/generate",
                {
                    method: "GET",
                    use: [sessionMiddleware],
                },
                async (ctx) => {
                    const session = ctx.context.session;
                    console.log({ session })

                    const expires = Date.now() + expiresIn * 1000;
                    const token = generateRandomString(32);

                    // Create signature
                    const secret = ctx.context.secret;
                    const signedToken = await createHMAC("SHA-256", "base64url").sign(secret, token)

                    // Store token → userId mapping
                    await ctx.context.internalAdapter.createVerificationValue({
                        value: `${session.user.id}:${signedToken}`,
                        identifier: `signed-url:${token}`,
                        expiresAt: new Date(expires),
                    });

                    // Build URL
                    const url = `${path}?token=${token}`;
                    return ctx.json({ url, expires });
                }
            ),

            verifySignedUrl: createAuthEndpoint(
                "/signed-url/verify",
                {
                    method: "GET",
                    use: [sessionMiddleware],
                    query: z.object({
                        token: z.string(),
                    }),
                },
                async (ctx) => {
                    const { token } = ctx.query;

                    const verification = await ctx.context.internalAdapter.findVerificationValue(
                        `signed-url:${token}`,
                    );
                    if (!verification) {
                        throw ctx.error("BAD_REQUEST", {
                            message: "Invalid token1",
                        });
                    }
                    await ctx.context.internalAdapter.deleteVerificationByIdentifier(
                        `signed-url:${token}`,
                    );
                    if (verification.expiresAt < new Date()) {
                        throw ctx.error("BAD_REQUEST", {
                            message: "Token expired",
                        });
                    }

                    // Verify signature (uses plugin-configured path)
                    const [userId, signedToken] = verification.value.split(":")
                    const secret = ctx.context.secret;
                    const expectedSignature = await createHMAC("SHA-256", "base64url").sign(secret, token)

                    if (signedToken !== expectedSignature) {
                        throw ctx.error("BAD_REQUEST", {
                            message: "Invalid token2",
                        });
                    }

                    return ctx.json({ valid: true, path, userId });
                }
            ),
        },
    } satisfies BetterAuthPlugin;
};

export const signedUrlClient = () => {
    return {
        id: "signed-url",
        $InferServerPlugin: {} as ReturnType<typeof signedUrl>,
    } satisfies BetterAuthClientPlugin;
};
