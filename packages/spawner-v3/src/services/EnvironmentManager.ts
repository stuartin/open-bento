import { Effect, Queue, Stream } from "effect";
import { Docker } from "./Docker";
import { OutputStorage } from "./OutputStorage";
import { FileSystem, Path } from "@effect/platform";

// Internal Environment class (not exported)
class Environment {
  constructor(
    public containerId: string,
    public outputPath: string,
    public workingDir: string,
    public lastActivityAt: Date,
    public commandCount: number,
    public commandQueue: Queue.Queue<CommandTask>
  ) { }
}

interface CommandTask {
  cmdId: string;
  command: string[];
}

// EnvironmentManager service using Effect.Service pattern
export class EnvironmentManager extends Effect.Service<EnvironmentManager>()("runner/EnvironmentManager", {
  effect: Effect.gen(function* () {
    const docker = yield* Docker;
    const storage = yield* OutputStorage;
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const environments = new Map<string, Environment>();
    const commandToEnv = new Map<string, string>();
    const maxConcurrentEnvironments = 50;

    const createEnvironment = (config: EnvironmentConfig) =>
      Effect.gen(function* () {
        // Check capacity
        if (environments.size >= maxConcurrentEnvironments) {
          yield* Effect.fail(new Error("Maximum concurrent environments reached"));
        }

        // Create output directory
        const outputPath = config.outputPath ?? `/tmp/runner-outputs/${config.id}`;
        yield* fs.makeDirectory(outputPath, { recursive: true });

        // Prepare volumes from filesFromPath
        const volumes: Array<{ host: string; container: string; readonly?: boolean }> = [];
        if (config.init?.filesFromPath) {
          for (const filePath of config.init.filesFromPath.files) {
            const fileExists = yield* fs.exists(filePath);
            if (!fileExists) {
              yield* Effect.fail(new Error(`File not found: ${filePath}`));
            }

            const stat = yield* fs.stat(filePath);
            const isDirectory = stat.type === "Directory";

            // Determine container path
            let containerPath: string;
            if (isDirectory) {
              const basename = path.basename(filePath);
              containerPath = path.join(config.init.filesFromPath.destination, basename);
            } else {
              const basename = path.basename(filePath);
              containerPath = path.join(config.init.filesFromPath.destination, basename);
            }

            volumes.push({
              host: filePath,
              container: containerPath,
              readonly: true
            });
          }
        }

        // Start container using Docker service
        const containerId = yield* docker.runContainer(
          config.id,
          config.image,
          config.env ?? {},
          volumes,
          config.workingDir ?? "/workspace"
        );

        // Download files if specified
        if (config.init?.fileFromUrl) {
          // Create destination directory first
          yield* docker.execWithExitCode(
            containerId,
            config.workingDir ?? "/workspace",
            ["mkdir", "-p", config.init.fileFromUrl.destination]
          );

          for (const url of config.init.fileFromUrl.files) {
            yield* docker.downloadFile(containerId, url, config.init.fileFromUrl.destination);
          }
        }

        // Run init commands
        if (config.init?.commands) {
          for (const cmd of config.init.commands) {
            const exitCode = yield* docker.execWithExitCode(
              containerId,
              config.workingDir ?? "/workspace",
              ["sh", "-c", cmd]
            );
            if (exitCode !== 0) {
              yield* docker.stopContainer(containerId);
              yield* Effect.fail(new Error(`Init command failed: ${cmd}`));
            }
          }
        }

        // Create command queue for this environment
        const commandQueue = yield* Queue.unbounded<CommandTask>();

        // Store environment
        const env = new Environment(
          containerId,
          outputPath,
          config.workingDir ?? "/workspace",
          new Date(),
          0,
          commandQueue
        );
        environments.set(config.id, env);

        // Start command processor for this environment
        yield* processCommandQueue(config.id, env).pipe(Effect.fork);

        // TODO: Implement auto-cleanup timeout using Effect.schedule
      });

    const processCommandQueue = (envId: string, env: Environment) =>
      Effect.gen(function* () {
        yield* Effect.forever(
          Effect.gen(function* () {
            const task = yield* Queue.take(env.commandQueue);

            // Initialize output files
            yield* storage.initCommand(task.cmdId, env.outputPath);

            // Execute command and stream output to files
            const commandStream = docker.exec(env.containerId, env.workingDir, task.command);

            // Convert Uint8Array stream to string and write to files
            yield* commandStream.pipe(
              Stream.decodeText("utf-8"),
              Stream.mapEffect((chunk) => storage.writeStdout(task.cmdId, env.outputPath, chunk)),
              Stream.runDrain,
              Effect.catchAll((error) =>
                Effect.gen(function* () {
                  yield* storage.writeStderr(task.cmdId, env.outputPath, `Error: ${error}`);
                  yield* storage.writeExitCode(task.cmdId, env.outputPath, 1);
                })
              )
            );

            // Get exit code using execWithExitCode
            const exitCode = yield* docker.execWithExitCode(env.containerId, env.workingDir, task.command);
            yield* storage.writeExitCode(task.cmdId, env.outputPath, exitCode);

            // Update environment activity
            env.lastActivityAt = new Date();
            env.commandCount++;
          })
        );
      });

    const runCommand = (envId: string, command: string[]) =>
      Effect.gen(function* () {
        const env = environments.get(envId);
        if (!env) {
          yield* Effect.fail(new Error(`Environment not found: ${envId}`));
        }

        const cmdId = `cmd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        commandToEnv.set(cmdId, envId);

        // Queue command for execution
        yield* Queue.offer(env!.commandQueue, { cmdId, command });

        return cmdId;
      });

    const getOutput = (cmdId: string) =>
      Effect.gen(function* () {
        const envId = commandToEnv.get(cmdId);
        if (!envId) {
          yield* Effect.fail(new Error(`Command not found: ${cmdId}`));
        }

        const env = environments.get(envId!);
        if (!env) {
          yield* Effect.fail(new Error(`Environment not found: ${envId}`));
        }

        return yield* storage.readOutput(cmdId, env!.outputPath);
      });

    const destroyEnvironment = (envId: string) =>
      Effect.gen(function* () {
        const env = environments.get(envId);
        if (!env) {
          yield* Effect.fail(new Error(`Environment not found: ${envId}`));
        }

        yield* docker.stopContainer(env!.containerId);
        environments.delete(envId);

        // Remove command mappings
        for (const [cmdId, id] of commandToEnv.entries()) {
          if (id === envId) {
            commandToEnv.delete(cmdId);
          }
        }
      });

    const getEnvironmentInfo = (envId: string) =>
      Effect.gen(function* () {
        const env = environments.get(envId);
        if (!env) {
          return null;
        }

        const isRunning = yield* docker.isRunning(env.containerId);

        return {
          id: envId,
          status: isRunning ? "ready" : "failed",
          lastActivityAt: env.lastActivityAt,
          commandCount: env.commandCount
        } as EnvironmentInfo;
      });

    return {
      createEnvironment,
      runCommand,
      getOutput,
      destroyEnvironment,
      getEnvironmentInfo
    } as const;
  }),
  dependencies: [Docker.Default, OutputStorage.Default]
}) {}

// Export types
export interface EnvironmentInfo {
  id: string;
  status: "starting" | "ready" | "busy" | "failed";
  lastActivityAt: Date;
  commandCount: number;
}

export interface EnvironmentConfig {
  id: string;
  image: string; // Docker image to use (e.g., "tofu:1.8.0")
  env?: Record<string, string>; // Environment variables for all commands
  outputPath?: string; // Where to store command outputs (default: /tmp/runner-outputs/{envId})
  workingDir?: string; // Working directory for commands (default: /workspace)
  timeoutMs?: number; // Auto-destroy after this many ms of inactivity (default: 300000 = 5min)
  init?: {
    filesFromPath?: { files: string[]; destination: string }; // Mount host files/folders (read-only)
    fileFromUrl?: { files: string[]; destination: string }; // Download files from URLs
    commands?: string[]; // Init commands (e.g., untar, setup, etc.)
  };
}

export interface CommandOutput {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}
