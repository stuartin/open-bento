// src/index.ts
import { Effect, Layer, ManagedRuntime, Match, Ref, Stream } from "effect";
import { NodeContext } from "@effect/platform-node";
import { EnvironmentManager, type EnvironmentConfig, type CommandOutput, type EnvironmentInfo } from "./services/EnvironmentManager";
import { PropsRef, type RunnerProps } from "./PropsRef";
import { ExecService, type StartProps } from "./services/ExecService";
import { Command } from "@effect/platform";

export type Runner = ReturnType<typeof makeRunner>
export function makeRunner(props?: RunnerProps) {

  // Update our propsRef
  Effect.runSync(
    Effect.gen(function* () {
      const propsRef = yield* PropsRef
      yield* Ref.update(propsRef, (p) => ({ ...p, ...props }))
    })
  )

  // Create our runtime
  const RuntimeLayer = Layer.mergeAll(
    EnvironmentManager.Default,
    ExecService.Default
  ).pipe(
    Layer.provideMerge(NodeContext.layer),
  )
  const runtime = ManagedRuntime.make(RuntimeLayer);

  return {
    testCommand: (props: StartProps) => runtime.runPromise(
      Effect.gen(function* () {
        const envService = yield* ExecService
        return yield* envService
          .start(props)
          .runCommands([
            Command.make("pwsh", "/C", "ls")
          ])
      })
    ),

    async createEnvironment(config: EnvironmentConfig) {
      return runtime.runPromise(
        Effect.gen(function* () {
          const manager = yield* EnvironmentManager;
          return yield* manager.createEnvironment(config);
        })
      );
    },

    async runCommand(envId: string, command: string[]): Promise<string> {
      return runtime.runPromise(
        Effect.gen(function* () {
          const manager = yield* EnvironmentManager;
          return yield* manager.runCommand(envId, command);
        })
      );
    },

    async getOutput(cmdId: string): Promise<CommandOutput> {
      return runtime.runPromise(
        Effect.gen(function* () {
          const manager = yield* EnvironmentManager;
          return yield* manager.getOutput(cmdId);
        })
      );
    },

    async destroyEnvironment(envId: string): Promise<void> {
      return runtime.runPromise(
        Effect.gen(function* () {
          const manager = yield* EnvironmentManager;
          return yield* manager.destroyEnvironment(envId);
        })
      );
    },

    async getEnvironmentInfo(envId: string): Promise<EnvironmentInfo | null> {
      return runtime.runPromise(
        Effect.gen(function* () {
          const manager = yield* EnvironmentManager;
          return yield* manager.getEnvironmentInfo(envId);
        })
      );
    },

    // Cleanup runtime and all resources
    async dispose(): Promise<void> {
      await runtime.dispose();
    }
  };
}

// Re-export types for convenience
export type { EnvironmentConfig, CommandOutput, EnvironmentInfo } from "./services/EnvironmentManager";
