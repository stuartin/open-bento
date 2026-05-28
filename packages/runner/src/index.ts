// src/index.ts
import { Effect, Layer, ManagedRuntime, Ref } from "effect";
import { NodeContext, NodeHttpClient } from "@effect/platform-node";
import { RunnerPropsRef, type RunnerProps } from "./RunnerPropsRef";
import { ExecService } from "./services/ExecService";
import { Command, FetchHttpClient } from "@effect/platform";
import type { Run } from "@open-bento/tfe";
import { LocalEnvService } from "./services/LocalEnvService";
import { DockerEnvService } from "./services/DockerEnvService";
import type { RunnerCallbacks } from "./types";

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
    switch (runnerProps.environment.name) {
      case "local": {
        return LocalEnvService.Default
      }
      case "docker": {
        return DockerEnvService.Default
      }
      default: {
        return LocalEnvService.Default
      }
    }
  }

  // Create our runtime
  const RuntimeLayer = Layer.mergeAll(
    ExecService.Default,
  ).pipe(
    Layer.provide(environmentService()),
    Layer.provide(FetchHttpClient.layer),
    Layer.provideMerge(NodeContext.layer),
  )
  const runtime = ManagedRuntime.make(RuntimeLayer);

  // API
  const TERRAFORM_VERSION = Command.make("terraform", "version")

  const init = (run: Run, url: string, callbacks: RunnerCallbacks) => runtime.runPromise(
    Effect.gen(function* () {
      const execService = yield* ExecService

      const result = yield* execService
        .start({
          run,
          url,
          opts: {
            noColor: true,
            ...callbacks
          }
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