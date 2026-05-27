import { Layer, Effect } from "effect";
import { EnvService } from "./EnvService";

export type DockerEnvProps = {
    readonly name: typeof DockerEnvService.Name
    readonly image: string
}

export const DockerEnvService = {
    Name: "docker" as const,
    Default: Layer.effect(
        EnvService,
        Effect.gen(function* () {

            return EnvService.of({
                runCommand: (cmd) => cmd,
                up: (props) => Effect.gen(function* () { }),
                down: (props) => Effect.gen(function* () { })
            });
        })
    )
}