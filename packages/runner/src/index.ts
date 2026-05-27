// src/index.ts
import { Effect, Layer, ManagedRuntime, Ref } from "effect";
import { NodeContext } from "@effect/platform-node";
import { PropsRef, type RunnerProps } from "./PropsRef";
import { ExecService, type ExecStartProps } from "./services/ExecService";
import { Command } from "@effect/platform";
import { EnvService } from "./services/EnvService";
import { LocalEnvService } from "./services/LocalEnvService";
import type { Run } from "@open-bento/tfe";

export type { StdOut, StdErr, ExitCode } from "./services/ExecService"

export type Runner = ReturnType<typeof makeRunner>
export function makeRunner(props: RunnerProps) {

  // Update our propsRef
  const allProps = Effect.runSync(
    Effect.gen(function* () {
      const propsRef = yield* PropsRef
      return yield* Ref.setAndGet(propsRef, props)
    })
  )

  // Environment Selector
  const environmentService = () => {
    switch (allProps.mode) {
      case "local": {
        return LocalEnvService.Default
      }
      default: {
        return LocalEnvService.Default
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
  const TERRAFORM_VERSION = Command.make("terraform", "version")

  const init = (run: Run, opts: ExecStartProps['opts']) => runtime.runPromise(
    Effect.gen(function* () {
      const envService = yield* EnvService

      const result = yield* envService.execute({
        id: run.data.id,
        commands: [
          TERRAFORM_VERSION,
          Command.make("terraform", "init"),
        ],
        opts
      })

      return result
    }),
  )

  const plan = (run: Run) => runtime.runPromise(
    Effect.gen(function* () {
      const envService = yield* EnvService

      const result = yield* envService.execute({
        id: run.data.id,
        commands: [
          TERRAFORM_VERSION,
          Command.make("terraform", "init"),
          Command.make("terraform", "plan")
        ]
      })

      return result
    }),
  )

  return {
    init,
    plan,
  };
}