import { FileSystem, Path } from "@effect/platform";
import { Layer, Effect } from "effect";
import { EnvService } from "./EnvService";
import { ENVIRONMENTS } from "..";

export const LocalEnvService = {
    Name: ENVIRONMENTS.LOCAL,
    Default: Layer.effect(
        EnvService,
        Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;

            // Define a target local sandbox directory
            const sandboxDir = path.resolve("./.local-sandbox");

            return EnvService.of({

                runCommand: (cmd) => cmd,

                up: (props) => Effect.gen(function* () {
                    yield* Effect.logInfo(`[ENV] (${props.id}): Creating sandbox workspace at: ${sandboxDir}`);

                    // Ensure a fresh, clean directory exists locally
                    const exists = yield* fs.exists(sandboxDir);
                    if (exists) {
                        yield* fs.remove(sandboxDir, { recursive: true });
                    }
                    yield* fs.makeDirectory(sandboxDir);
                }).pipe(
                    // Map standard platform filesystem errors to a standard Error object
                    Effect.mapError((fsError) => new Error(`Failed to initialize local sandbox: ${fsError.message}`))
                ),

                down: (props) => Effect.gen(function* () {
                    yield* Effect.logInfo(`[ENV] (${props.id}): Cleaning up sandbox directory...`);
                    yield* fs.remove(sandboxDir, { recursive: true });
                }).pipe(
                    Effect.mapError((fsError) => new Error(`Failed to purge local sandbox: ${fsError.message}`))
                )
            });
        })
    )
}