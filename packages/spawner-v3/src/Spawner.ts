import { ConfigError, Data, Effect, Layer, ManagedRuntime } from "effect";
import { RunRunner } from "./services/RunRunner";
import { Config } from "./services/Config";
import { Docker } from "./services/Docker";
import type { Run, RunStatus } from "@open-bento/types";

export type OnStatusUpdate = (
  runId: string,
  status: RunStatus,
) => Promise<void>;
export type OnLogs = (runId: string, logs: string[]) => Promise<void>;

export interface SpawnerConfig {
  onStatusUpdate: OnStatusUpdate;
  onLogs: OnLogs;
}

class ConfigNotDefinedError extends Data.TaggedError("ConfigNotDefinedError")<{ config: "config" | "onStatusUpdate" | "onLogs" }> { }

export class Spawner {
  private constructor() { }
  static #instance: Spawner

  private runtime!: ManagedRuntime.ManagedRuntime<RunRunner | Config | Docker, ConfigError.ConfigError>;
  public config: SpawnerConfig | undefined

  public static async get(config?: SpawnerConfig) {
    if (!Spawner.#instance) {
      Spawner.#instance = new Spawner();
      Spawner.#instance.initRuntime()
    }

    return Spawner.#instance;
  }

  private initRuntime() {
    const RuntimeLayer = Layer.mergeAll(
      Docker.Default,
      RunRunner.Default,
    ).pipe(
      Layer.provideMerge(Config.Default)
    )

    const runtime = ManagedRuntime.make(RuntimeLayer)
    this.runtime = runtime
  }

  public start(): void {
    if (!this.config?.onStatusUpdate) throw new ConfigNotDefinedError({ config: "onStatusUpdate" })
    if (!this.config?.onLogs) throw new ConfigNotDefinedError({ config: "onStatusUpdate" })

    const onStatus = (runId: string, status: RunStatus) =>
      Effect.promise(() => this.config!.onStatusUpdate(runId, status));

    const onLogs = (runId: string, logs: string[]) =>
      Effect.promise(() => this.config!.onLogs(runId, logs))


    const program = Effect.gen(function* () {
      const runRunner = yield* RunRunner;
      yield* runRunner.start(onStatus, onLogs);
    })

    this.runtime.runFork(program);
  }

  async queueRun(run: Run): Promise<boolean> {
    return this.runtime.runPromise(
      Effect.gen(function* () {
        const runRunner = yield* RunRunner;
        return yield* runRunner.enqueue(run);
      }),
    );
  }

  async dispose(): Promise<void> {
    await this.runtime.dispose();
  }
}
