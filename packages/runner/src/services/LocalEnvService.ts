import { FileSystem, Path } from "@effect/platform";
import { Layer, Effect, Ref } from "effect";
import { EnvService } from "./EnvService";
import { RunnerPropsRef } from "../RunnerPropsRef";

export type LocalEnvProps = {
    readonly name: typeof LocalEnvService.Name
    readonly path: string
}

export const LocalEnvService = {
    Name: "local" as const,
    Default: Layer.effect(
        EnvService,
        Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const runnerPropsRef = yield* RunnerPropsRef
            const runnerProps = yield* Ref.get(runnerPropsRef)
            const runnerEnv = runnerProps.env as LocalEnvProps

            const rootPath = path.resolve(runnerEnv.path, "tmp");
            const getEnvPath = (id: string) => path.resolve(rootPath, id)

            return EnvService.of({

                runCommand: (cmd) => cmd,

                up: (props) => Effect.gen(function* () {
                    const envPath = getEnvPath(props.id)
                    yield* Effect.logInfo(`[ENV] (${props.id}): Create env: ${envPath}`);

                    // create
                    const exists = yield* fs.exists(envPath);
                    if (exists) {
                        yield* fs.remove(envPath, { recursive: true });
                    }
                    yield* fs.makeDirectory(envPath, { recursive: true });
                }).pipe(
                    Effect.mapError((fsError) => new Error(`Failed to create env: ${fsError.message}`))
                ),

                down: (props) => Effect.gen(function* () {
                    const envPath = getEnvPath(props.id)
                    yield* Effect.logInfo(`[ENV] (${props.id}): Delete env: ${envPath}`);

                    // delete
                    yield* fs.remove(envPath, { recursive: true });
                }).pipe(
                    Effect.mapError((fsError) => new Error(`Failed to delete env: ${fsError.message}`))
                )
            });
        })
    )
}