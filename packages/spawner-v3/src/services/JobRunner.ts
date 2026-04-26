import { Chunk, Effect, Queue, Stream } from "effect";
import { Docker } from "./Docker";
import { Config } from "./Config";
import { NodeContext } from "@effect/platform-node";
import type { JobStatus, Job } from "@open-bento/types";
import { Command, FileSystem, Path } from "@effect/platform";
import { tofuDockerfile } from "../lib/tofu-dockerfile";
import { } from "node:fs/promises"

type StatusCallback = (jobId: string, status: JobStatus) => Effect.Effect<void>;
type LogCallback = (jobId: string, logs: string[]) => Effect.Effect<void>;

export class JobRunner extends Effect.Service<JobRunner>()("JobRunner", {
  effect: Effect.gen(function* () {
    const config = yield* Config;
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
          const imageTag = `${job.tool}:${job.toolVersion}`;
          const exists = yield* docker.imageExists(imageTag);
          if (!exists) {
            // Create tmp dir
            Effect.log('Need to create image', job.tool, job.toolVersion)
            const fs = yield* FileSystem.FileSystem
            const path = yield* Path.Path
            const tmpDir = yield* fs.makeTempDirectoryScoped({ prefix: `open-bento-tmp-${job.id}-` })

            const dockerfile = tofuDockerfile(job.toolVersion)
            const dockerfilePath = path.join(tmpDir, "Dockerfile")
            yield* fs.writeFileString(dockerfilePath, dockerfile)

            console.log({ tmpDir })
            yield* docker.buildImage(imageTag, dockerfilePath, tmpDir)
          }

          yield* onStatus(job.id, "running");

          // Run container and stream logs
          const logs = docker.runContainer(
            job.id,
            imageTag,
            ["version", "-json"],
            {
              JOB_ID: job.id,
              FOLDER_ID: job.folderId,
            }
          );

          yield* logs.pipe(
            Stream.grouped(50),
            Stream.mapEffect((chunk) => onLogs(
              job.id,
              Chunk.toArray(chunk)
            )
            ),
            Stream.runDrain,
          );

          return "success" as const;
        }),
      ).pipe(
        Effect.provide(NodeContext.layer),
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
      )

    return {
      enqueue: (job: Job) => Queue.offer(queue, job),

      start: (onStatus: StatusCallback, onLogs: LogCallback) =>
        Effect.gen(function* () {
          yield* Effect.log(`Job runner started (max ${config.maxConcurrentJobs} concurrent jobs)`);
          const semaphore = yield* Effect.makeSemaphore(config.maxConcurrentJobs);

          yield* Effect.forever(
            Effect.gen(function* () {
              const job = yield* Queue.take(queue);
              yield* Effect.log(`Job ${job.id} received, spawning worker`);

              yield* semaphore.withPermits(1)(
                Effect.gen(function* () {
                  yield* executeJob(job, onStatus, onLogs)

                })
              ).pipe(Effect.fork);
            }),
          );
        })
    };
  }),
  dependencies: [Docker.Default, Config.Default],
}) { }
