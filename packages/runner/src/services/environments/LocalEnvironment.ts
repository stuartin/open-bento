import { Layer, Effect } from "effect"
import { ExecService } from "../ExecService"
import { EnvironmentService } from "./EnvironmentService"
import type { Command } from "@effect/platform"

export class LocalEnvironmentService {
    static WrapCommand = (command: Command.Command) => {
        return command
    }

    static Default = Layer.succeed(
        EnvironmentService,
        (() => {
            const service = EnvironmentService.of({
                start: Effect.logInfo(`[LOCAL] Started`),
                stop: Effect.logInfo(`[LOCAL] Stopped`),

                execute: (props, commands) => Effect.gen(function* () {
                    yield* service.start
                    yield* Effect.addFinalizer(() => service.stop)

                    const execService = yield* ExecService
                    return yield* execService
                        .start(props)
                        .runCommands(commands.map(LocalEnvironmentService.WrapCommand))
                }).pipe(
                    Effect.scoped
                ),
            })

            return service
        })()
    )
}