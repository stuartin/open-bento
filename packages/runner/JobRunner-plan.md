# JobRunnerService Implementation Plan

MVP implementation using Effect-TS v4 and Sysbox as outlined in README.md.

## Requirements (from README)

- Queue with configurable concurrent jobs (default: 5)
- Job lifecycle with scopes and finalizers
- Build docker image if it doesn't exist
- Run docker image with sysbox runtime
- Stream stdout/stderr to database (via callbacks)
- Exit code updates job status

---

## Project Structure

```
packages/runner/
├── src/
│   ├── index.ts           # Public exports
│   ├── Runner.ts          # ManagedRuntime + public API
│   ├── services/
│   │   ├── Config.ts      # Configuration
│   │   ├── Docker.ts      # Docker operations
│   │   └── JobRunner.ts   # Queue + job execution
│   └── types.ts           # Shared types
├── tofu.Dockerfile
├── package.json
└── tsconfig.json
```

---

## 1. Dependencies

- Add to pnpm-workspace.yaml under catalog
- Add to packages/runner/package.json as catalog:

```json
{
  "dependencies": {
    "effect": "beta",
    "@effect/platform": "beta",
    "@effect/platform-node": "beta"
  }
}
```

---

## 2. Types

```typescript
// src/types.ts
import { zSchema } from "@open-bento/types";

export type JobType = z.infer<typeof zSchema.Job.shape.type>;
export type JobStatus = z.infer<typeof zSchema.Job.shape.status>;
export type Job = z.infer<typeof zSchema.Job>;
```

---

## 3. Config Service

```typescript
// src/services/Config.ts
import { Config, Context, Effect, Layer } from "effect";

interface ConfigShape {
  readonly maxConcurrentJobs: number;
  readonly sysboxRuntime: string;
}

export class RunnerConfig extends Context.Service<RunnerConfig, ConfigShape>()(
  "RunnerConfig",
  {
    make: Effect.gen(function* () {
      return {
        maxConcurrentJobs: yield* Config.number("MAX_CONCURRENT_JOBS").pipe(
          Config.withDefault(5),
        ),
        sysboxRuntime: yield* Config.string("SYSBOX_RUNTIME").pipe(
          Config.withDefault("sysbox-runc"),
        ),
      };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
```

---

## 4. Docker Service

```typescript
// src/services/Docker.ts
import { Command } from "@effect/platform";
import { Context, Effect, Layer, Stream } from "effect";
import { RunnerConfig } from "./Config";

export class Docker extends Context.Service<
  Docker,
  {
    readonly imageExists: (tag: string) => Effect.Effect<boolean>;
    readonly buildImage: (tag: string) => Effect.Effect<void>;
    readonly runContainer: (
      image: string,
      args: string[],
      env: Record<string, string>,
    ) => Stream.Stream<string, Error>;
  }
>()("Docker", {
  make: Effect.gen(function* () {
    const config = yield* RunnerConfig;

    return {
      imageExists: (tag: string) =>
        Command.make("docker", "image", "inspect", tag).pipe(
          Command.exitCode,
          Effect.map((code) => code === 0),
        ),

      buildImage: (tag: string) =>
        Command.make(
          "docker",
          "build",
          "-f",
          "tofu.Dockerfile",
          "-t",
          tag,
          ".",
        ).pipe(Command.exitCode, Effect.asVoid),

      runContainer: (
        image: string,
        args: string[],
        env: Record<string, string>,
      ) =>
        Command.make(
          "docker",
          "run",
          "--rm",
          "--runtime",
          config.sysboxRuntime,
          ...Object.entries(env).flatMap(([k, v]) => ["-e", `${k}=${v}`]),
          image,
          ...args,
        ).pipe(Command.streamLines),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(RunnerConfig.layer),
  );
}
```

---

## 5. JobRunner Service

Combines queue management and job execution with lifecycle handling.

```typescript
// src/services/JobRunner.ts
import { Chunk, Context, Effect, Layer, Queue, Stream } from "effect";
import { Docker } from "./Docker";
import { RunnerConfig } from "./Config";
import type { Job, JobStatus } from "../types";

type StatusCallback = (jobId: string, status: JobStatus) => Effect.Effect<void>;
type LogCallback = (jobId: string, logs: string[]) => Effect.Effect<void>;

export class JobRunner extends Context.Service<
  JobRunner,
  {
    readonly enqueue: (job: Job) => Effect.Effect<boolean>;
    readonly start: (
      onStatus: StatusCallback,
      onLogs: LogCallback,
    ) => Effect.Effect<never>;
  }
>()("JobRunner", {
  make: Effect.gen(function* () {
    const config = yield* RunnerConfig;
    const docker = yield* Docker;
    const queue = yield* Queue.bounded<Job>(100);

    const executeJob = (
      job: Job,
      onStatus: StatusCallback,
      onLogs: LogCallback,
    ) =>
      Effect.scoped(
        Effect.gen(function* () {
          yield* onStatus(job.id, "started");

          // Build image if needed
          const imageTag = `tofu:${job.type}`;
          const exists = yield* docker.imageExists(imageTag);
          if (!exists) {
            yield* docker.buildImage(imageTag);
          }

          yield* onStatus(job.id, "running");

          // Run container and stream logs
          const logs = docker.runContainer(imageTag, [job.type], {
            JOB_ID: job.id,
            FOLDER_ID: job.folderId,
          });

          yield* logs.pipe(
            Stream.grouped(50),
            Stream.mapEffect((chunk) => onLogs(job.id, Chunk.toArray(chunk))),
            Stream.runDrain,
          );

          return "success" as const;
        }),
      ).pipe(
        Effect.ensuring(Effect.log(`Job ${job.id} cleanup`)),
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* onStatus(job.id, "error");
            yield* Effect.logError(`Job ${job.id} failed`, error);
            return "error" as const;
          }),
        ),
        Effect.tap((status) =>
          status === "success" ? onStatus(job.id, "success") : Effect.void,
        ),
      );

    return {
      enqueue: (job: Job) => Queue.offer(queue, job),

      start: (onStatus: StatusCallback, onLogs: LogCallback) =>
        Effect.gen(function* () {
          yield* Effect.log(`Starting ${config.maxConcurrentJobs} workers`);

          const workers = Array.from(
            { length: config.maxConcurrentJobs },
            (_, i) =>
              Effect.gen(function* () {
                yield* Effect.log(`Worker ${i} ready`);
                yield* Effect.forever(
                  Effect.gen(function* () {
                    const job = yield* Queue.take(queue);
                    yield* executeJob(job, onStatus, onLogs);
                  }),
                );
              }),
          );

          yield* Effect.all(workers, { concurrency: "unbounded" });
        }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(Docker.layer),
    Layer.provide(RunnerConfig.layer),
  );
}
```

---

## 6. Public API (ManagedRuntime)

```typescript
// src/Runner.ts
import { Effect, ManagedRuntime } from "effect";
import { JobRunner } from "./services/JobRunner";
import type { Job, JobStatus } from "./types";

// Create managed runtime with all services
const runtime = ManagedRuntime.make(JobRunner.layer);

export type OnStatusUpdate = (
  jobId: string,
  status: JobStatus,
) => Promise<void>;
export type OnLogs = (jobId: string, logs: string[]) => Promise<void>;

export interface RunnerConfig {
  readonly onStatusUpdate: OnStatusUpdate;
  readonly onLogs: OnLogs;
}

export class Runner {
  private config: RunnerConfig;

  constructor(config: RunnerConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    const onStatus = (jobId: string, status: JobStatus) =>
      Effect.promise(() => this.config.onStatusUpdate(jobId, status));

    const onLogs = (jobId: string, logs: string[]) =>
      Effect.promise(() => this.config.onLogs(jobId, logs));

    const program = Effect.gen(function* () {
      const jobRunner = yield* JobRunner;
      yield* jobRunner.start(onStatus, onLogs);
    });

    runtime.runFork(program);
  }

  async queueJob(job: Job): Promise<boolean> {
    return runtime.runPromise(
      Effect.gen(function* () {
        const jobRunner = yield* JobRunner;
        return yield* jobRunner.enqueue(job);
      }),
    );
  }

  async dispose(): Promise<void> {
    await runtime.dispose();
  }
}
```

---

## 7. Exports

```typescript
// src/index.ts
export {
  Runner,
  type RunnerConfig,
  type OnStatusUpdate,
  type OnLogs,
} from "./Runner";
export type { Job, JobType, JobStatus } from "./types";
```

---

## Usage

```typescript
import { Runner } from "@open-bento/runner";

const runner = new Runner({
  onStatusUpdate: async (jobId, status) => {
    await db.jobs.update(jobId, { status });
  },
  onLogs: async (jobId, logs) => {
    await db.jobs.appendLogs(jobId, logs.join("\n"));
  },
});

await runner.start();

await runner.queueJob({
  id: "job-123",
  organizationId: "org-456",
  projectId: "proj-789",
  folderId: "folder-abc",
  type: "plan",
});

// Graceful shutdown
await runner.dispose();
```

---

## Environment Variables

| Variable              | Default       | Description                          |
| --------------------- | ------------- | ------------------------------------ |
| `MAX_CONCURRENT_JOBS` | `5`           | Number of concurrent job workers     |
| `SYSBOX_RUNTIME`      | `sysbox-runc` | Docker runtime for nested containers |

---

## References

- [Effect Services (v4)](https://github.com/Effect-TS/effect-smol/blob/main/migration/services.md)
- [Effect ManagedRuntime](https://effect.website/docs/runtime/#managedruntime)
- [Effect Command](https://effect.website/docs/platform/command/)
- [Sysbox](https://github.com/nestybox/sysbox)
