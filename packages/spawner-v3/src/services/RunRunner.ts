import { Chunk, Effect, Queue, Stream } from "effect";
import { Docker } from "./Docker";
import { Config } from "./Config";
import { NodeContext } from "@effect/platform-node";
import type { RunStatus, Run } from "@open-bento/types";
import { Command, FileSystem, Path } from "@effect/platform";
import { tofuDockerfile } from "../lib/tofu-dockerfile";
import { } from "node:fs/promises"

type StatusCallback = (runId: string, status: RunStatus) => Effect.Effect<void>;
type LogCallback = (runId: string, logs: string[]) => Effect.Effect<void>;

export class RunRunner extends Effect.Service<RunRunner>()("RunRunner", {
  effect: Effect.gen(function* () {
    const config = yield* Config;
    const docker = yield* Docker;
    const queue = yield* Queue.bounded<Run>(100);

    const executeRun = (
      run: Run,
      onStatus: StatusCallback,
      onLogs: LogCallback,
    ) =>
      Effect.scoped(
        Effect.gen(function* () {
          yield* onStatus(run.id, "started");



          // Build image if needed
          const imageTag = `${run.tool}:${run.toolVersion}`;
          const exists = yield* docker.imageExists(imageTag);
          if (!exists) {
            // Create tmp dir
            Effect.log('Need to create image', run.tool, run.toolVersion)
            const fs = yield* FileSystem.FileSystem
            const path = yield* Path.Path
            const tmpDir = yield* fs.makeTempDirectoryScoped({ prefix: `open-bento-tmp-${run.id}-` })

            const dockerfile = tofuDockerfile(run.toolVersion)
            const dockerfilePath = path.join(tmpDir, "Dockerfile")
            yield* fs.writeFileString(dockerfilePath, dockerfile)

            console.log({ tmpDir })
            yield* docker.buildImage(imageTag, dockerfilePath, tmpDir)
          }

          yield* onStatus(run.id, "running");

          // Run container and stream logs
          const logs = docker.runContainer(
            run.id,
            imageTag,
            ["version", "-json"],
            {
              RUN_ID: run.id,
              WORKSPACE_ID: run.workspaceId,
            }
          );

          yield* logs.pipe(
            Stream.grouped(50),
            Stream.mapEffect((chunk) => onLogs(
              run.id,
              Chunk.toArray(chunk)
            )
            ),
            Stream.runDrain,
          );

          return "success" as const;
        }),
      ).pipe(
        Effect.provide(NodeContext.layer),
        Effect.ensuring(Effect.log(`Run ${run.id} cleanup`)),
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* onStatus(run.id, "error");
            yield* Effect.logError(`Run ${run.id} failed`, error);
            return "error" as const;
          }),
        ),
        Effect.tap((status) =>
          status === "success" ? onStatus(run.id, "success") : Effect.void,
        ),
      )

    return {
      enqueue: (run: Run) => Queue.offer(queue, run),

      start: (onStatus: StatusCallback, onLogs: LogCallback) =>
        Effect.gen(function* () {
          yield* Effect.log(`Run runner started (max ${config.maxConcurrentRuns} concurrent runs)`);
          const semaphore = yield* Effect.makeSemaphore(config.maxConcurrentRuns);

          yield* Effect.forever(
            Effect.gen(function* () {
              const run = yield* Queue.take(queue);
              yield* Effect.log(`Run ${run.id} received, spawning worker`);

              yield* semaphore.withPermits(1)(
                Effect.gen(function* () {
                  yield* executeRun(run, onStatus, onLogs)

                })
              ).pipe(Effect.fork);
            }),
          );
        })
    };
  }),
  dependencies: [Docker.Default, Config.Default],
}) { }
