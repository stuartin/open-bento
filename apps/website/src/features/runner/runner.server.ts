import { env } from "$features/env/env.private.server";
import { makeRunner } from "@open-bento/runner";

export const runner = makeRunner({
    maxConcurrent: 10,
    env: {
        ...(
            env.RUNNER_ENV === "local"
                ? { name: env.RUNNER_ENV, path: env.RUNNER_LOCAL_PATH }
                : { name: env.RUNNER_ENV, image: env.RUNNER_DOCKER_IMAGE }
        )
    }
})