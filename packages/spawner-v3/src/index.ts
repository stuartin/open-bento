// src/index.ts
import { Effect, Layer, ManagedRuntime } from "effect";
import { NodeContext } from "@effect/platform-node";
import { EnvironmentManager, type EnvironmentConfig, type CommandOutput, type EnvironmentInfo } from "./services/EnvironmentManager";

export function makeRunner() {
  // Merge EnvironmentManager with NodeContext to provide both
  const RuntimeLayer = Layer.merge(
    Layer.provide(EnvironmentManager.Default, NodeContext.layer),
    NodeContext.layer
  );

  const runtime = ManagedRuntime.make(RuntimeLayer);

  return {
    async createEnvironment(config: EnvironmentConfig): Promise<void> {
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
