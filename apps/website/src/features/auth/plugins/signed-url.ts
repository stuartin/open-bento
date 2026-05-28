import type { BetterAuthClientPlugin } from "better-auth";
import type { signedUrl } from "./signed-url.server";

export const signedUrlClient = () => {
    return {
        id: "signed-url",
        $InferServerPlugin: {} as ReturnType<typeof signedUrl>,
    } satisfies BetterAuthClientPlugin;
};