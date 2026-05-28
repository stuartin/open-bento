import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import type { BetterAuthPlugin } from "better-auth";
import { generateRandomString } from "better-auth/crypto";
import { createHMAC } from "@better-auth/utils/hmac";
import { oauthSessionMiddleware } from "./oauth-session.server";

const GenerateSignedUrlOptions = z.object({
    identifier: z.string(),
    url: z.url(),
    expireInMins: z.number().positive().max(1440).default(5) // max 24h
})

export const signedUrl = () => ({
    id: "signed-url",
    endpoints: {
        generateSignedUrl: createAuthEndpoint(
            "/signed-url/generate",
            {
                method: "POST",
                use: [oauthSessionMiddleware],
                body: GenerateSignedUrlOptions
            },
            async (ctx) => {
                const session = ctx.context.session;
                const identifier = ctx.body.identifier
                const expires = Date.now() + (ctx.body.expireInMins * 60) * 1000;
                const token = generateRandomString(32);

                // Create signature
                const secret = ctx.context.secret;
                const signedToken = await createHMAC("SHA-256", "base64url").sign(secret, token)

                // Store token → userId mapping
                await ctx.context.internalAdapter.createVerificationValue({
                    value: `${signedToken}:${identifier}:${session?.user.id}`,
                    identifier: `signed-url:${token}`,
                    expiresAt: new Date(expires),
                });

                // Build URL
                const url = `${ctx.body.url}?token=${token}`;
                return ctx.json({ url, expires });
            }
        ),

        verifySignedUrl: createAuthEndpoint(
            "/signed-url/verify",
            {
                method: "GET",
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
                        message: "Invalid token",
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
                const [signedToken, identifier, userId] = verification.value.split(":")
                const secret = ctx.context.secret;
                const expectedSignature = await createHMAC("SHA-256", "base64url").sign(secret, token)

                if (signedToken !== expectedSignature) {
                    throw ctx.error("BAD_REQUEST", {
                        message: "Invalid token",
                    });
                }

                return ctx.json({ ok: true, identifier, userId });
            }
        ),
    },
}) satisfies BetterAuthPlugin;
