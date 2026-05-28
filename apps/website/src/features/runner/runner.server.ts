import { env } from "$features/env/env.server";
import { makeRunner } from "@open-bento/runner";

export const runner = makeRunner({
    maxConcurrent: 10,
    environment: {
        ...(
            env.RUNNER_ENV === "local"
                ? { name: env.RUNNER_ENV, path: env.RUNNER_LOCAL_PATH }
                : { name: env.RUNNER_ENV, image: env.RUNNER_DOCKER_IMAGE }
        )
    }
})