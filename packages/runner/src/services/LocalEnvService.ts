import { Command, FileSystem, Path } from "@effect/platform";
import { Layer, Effect, Ref, Match } from "effect";
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
            const runnerEnv = runnerProps.environment as LocalEnvProps

            const rootPath = path.resolve(runnerEnv.path, "runs");
            const getEnvPath = (run: string) => path.resolve(rootPath, run)

            return EnvService.of({

                runCommand: (cmd) => Match.value(cmd).pipe(
                    Match.tag("StandardCommand", (c) => Command.make(c.command, ...c.args).pipe(
                        // Command.workingDirectory("")
                    )),
                    Match.tag("PipedCommand", (c) => c),
                    Match.exhaustive
                ),

                up: (run) => Effect.gen(function* () {
                    const envPath = getEnvPath(run.data.id)
                    yield* Effect.logInfo(`[ENV] (${run.data.id}): Create env: ${envPath}`);

                    // create
                    const exists = yield* fs.exists(envPath);
                    if (exists) {
                        yield* fs.remove(envPath, { recursive: true });
                    }
                    yield* fs.makeDirectory(envPath, { recursive: true });
                }).pipe(
                    Effect.mapError((fsError) => new Error(`Failed to create env: ${fsError.message}`))
                ),

                down: (run) => Effect.gen(function* () {
                    const envPath = getEnvPath(run.data.id)
                    yield* Effect.logInfo(`[ENV] (${run.data.id}): Delete env: ${envPath}`);

                    // delete
                    yield* fs.remove(envPath, { recursive: true });
                }).pipe(
                    Effect.mapError((fsError) => new Error(`Failed to delete env: ${fsError.message}`))
                )
            });
        })
    )
}