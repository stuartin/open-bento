import { ConfigError, Data, Effect, Layer, ManagedRuntime } from "effect";
import { JobRunner } from "./services/JobRunner";
import { Config } from "./services/Config";
import { Docker } from "./services/Docker";
import type { Job, JobStatus } from "@open-bento/types";

export type OnStatusUpdate = (
  jobId: string,
  status: JobStatus,
) => Promise<void>;
export type OnLogs = (jobId: string, logs: string[]) => Promise<void>;

export interface SpawnerConfig {
  onStatusUpdate: OnStatusUpdate;
  onLogs: OnLogs;
}

class ConfigNotDefinedError extends Data.TaggedError("ConfigNotDefinedError")<{ config: "config" | "onStatusUpdate" | "onLogs" }> { }

export class Spawner {
  private constructor() { }
  static #instance: Spawner

  private runtime!: ManagedRuntime.ManagedRuntime<JobRunner | Config | Docker, ConfigError.ConfigError>;
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
      JobRunner.Default,
    ).pipe(
      Layer.provideMerge(Config.Default)
    )

    const runtime = ManagedRuntime.make(RuntimeLayer)
    this.runtime = runtime
  }

  public start(): void {
    if (!this.config?.onStatusUpdate) throw new ConfigNotDefinedError({ config: "onStatusUpdate" })
    if (!this.config?.onLogs) throw new ConfigNotDefinedError({ config: "onStatusUpdate" })

    const onStatus = (jobId: string, status: JobStatus) =>
      Effect.promise(() => this.config!.onStatusUpdate(jobId, status));

    const onLogs = (jobId: string, logs: string[]) =>
      Effect.promise(() => this.config!.onLogs(jobId, logs))


    const program = Effect.gen(function* () {
      const jobRunner = yield* JobRunner;
      yield* jobRunner.start(onStatus, onLogs);
    })

    this.runtime.runFork(program);
  }

  async queueJob(job: Job): Promise<boolean> {
    return this.runtime.runPromise(
      Effect.gen(function* () {
        const jobRunner = yield* JobRunner;
        return yield* jobRunner.enqueue(job);
      }),
    );
  }

  async dispose(): Promise<void> {
    await this.runtime.dispose();
  }
}
