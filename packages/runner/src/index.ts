// src/index.ts
import { Effect, Layer, ManagedRuntime, Ref } from "effect";
import { NodeContext } from "@effect/platform-node";
import { RunnerPropsRef, type RunnerProps } from "./RunnerPropsRef";
import { ExecService, type ExecStartProps } from "./services/ExecService";
import { Command } from "@effect/platform";
import type { Run } from "@open-bento/tfe";
import { LocalEnvService } from "./services/LocalEnvService";

export type { StdOut, StdErr, ExitCode } from "./services/ExecService"
export const ENVIRONMENTS = {
  LOCAL: "local",
  DOCKER: "docker"
} as const

export type Runner = ReturnType<typeof makeRunner>
export function makeRunner(props: RunnerProps) {

  // Update our runnerPropsRef
  const runnerProps = Effect.runSync(
    Effect.gen(function* () {
      const runnerPropsRef = yield* RunnerPropsRef
      return yield* Ref.setAndGet(runnerPropsRef, props)
    })
  )

  // Environment Selector
  const environmentService = () => {
    switch (runnerProps.mode) {
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
    ExecService.Default.pipe(Layer.provide(environmentService()))
  ).pipe(
    Layer.provideMerge(NodeContext.layer),
  )
  const runtime = ManagedRuntime.make(RuntimeLayer);

  // API
  const TERRAFORM_VERSION = Command.make("terraform", "version")

  const init = (run: Run, opts: ExecStartProps['opts']) => runtime.runPromise(
    Effect.gen(function* () {
      const execService = yield* ExecService

      const result = yield* execService
        .start({
          id: run.data.id,
          opts
        })
        .runCommands([
          TERRAFORM_VERSION,
          Command.make("terraform", "init")
        ])

      return result
    }),
  )

  const plan = (run: Run) => runtime.runPromise(
    Effect.gen(function* () {
      // const envService = yield* EnvService

      // const result = yield* envService.execute({
      //   id: run.data.id,
      //   commands: [
      //     TERRAFORM_VERSION,
      //     Command.make("terraform", "init"),
      //     Command.make("terraform", "plan")
      //   ]
      // })

      // return result
    }),
  )

  return {
    init,
    plan,
  };
}