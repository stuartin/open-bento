// src/index.ts
import { Effect, Layer, ManagedRuntime, Ref } from "effect";
import { NodeContext } from "@effect/platform-node";
import { PropsRef, type RunnerProps } from "./PropsRef";
import { ExecService, type StartProps } from "./services/ExecService";
import { Command } from "@effect/platform";
import { EnvironmentService } from "./services/environments/EnvironmentService";
import { LocalEnvironmentService } from "./services/environments/LocalEnvironment";

export type Runner = ReturnType<typeof makeRunner>
export function makeRunner(props?: RunnerProps) {

  // Update our propsRef
  const allProps = Effect.runSync(
    Effect.gen(function* () {
      const propsRef = yield* PropsRef
      return yield* Ref.getAndUpdate(propsRef, (p) => ({ ...p, ...props }))
    })
  )

  // Environment Selector
  const environmentService = () => {
    switch (allProps.environment) {
      default:
      case "local": {
        return LocalEnvironmentService.Default
      }
    }
  }

  // Create our runtime
  const RuntimeLayer = Layer.mergeAll(
    ExecService.Default,
    environmentService()
  ).pipe(
    Layer.provideMerge(NodeContext.layer),
  )
  const runtime = ManagedRuntime.make(RuntimeLayer);

  // API
  const init = (props: StartProps) => runtime.runPromise(
    Effect.gen(function* () {
      const envService = yield* EnvironmentService

      const result = yield* envService.execute(
        props,
        [
          Command.make("terraform", "version")
        ]
      )

      return result
    }),
  )

  return {
    init
  };
}