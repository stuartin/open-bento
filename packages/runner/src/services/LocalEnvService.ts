import { Layer, Effect } from "effect"
import { ExecService } from "./ExecService"
import { EnvService } from "./EnvService"
import type { Command } from "@effect/platform"

// biome-ignore lint/complexity/noStaticOnlyClass: Follows effect pattern
export class LocalEnvService {
    static WrapCommand = (command: Command.Command) => {
        return command
    }

    static Default = Layer.succeed(
        EnvService,
        (() => {
            const service = EnvService.of({
                start: Effect.logInfo(`[LOCAL] Started`),
                stop: Effect.logInfo(`[LOCAL] Stopped`),

                execute: (props) => Effect.gen(function* () {
                    yield* service.start
                    yield* Effect.addFinalizer(() => service.stop)

                    const execService = yield* ExecService
                    return yield* execService
                        .start(props)
                        .runCommands(props.commands.map(LocalEnvService.WrapCommand))
                }).pipe(
                    Effect.scoped
                ),
            })

            return service
        })()
    )
}