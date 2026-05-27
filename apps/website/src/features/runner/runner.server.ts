import { env } from "$features/env/env.private.server";
import { makeRunner } from "@open-bento/runner";

export const runner = makeRunner({
    maxConcurrent: 10,
    ...(
        env.RUNNER_MODE === "local"
            ? { mode: env.RUNNER_MODE, path: env.RUNNER_PATH }
            : { mode: env.RUNNER_MODE }
    )
})