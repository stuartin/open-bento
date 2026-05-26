import { Command } from "@effect/platform";
import { Effect } from "effect";

// Docker service using Effect.Service pattern
export class Docker extends Effect.Service<Docker>()("runner/Docker", {
  sync: () => {
    // Start a container with volume mounts
    const runContainer = (
      name: string,
      image: string,
      envVars: Record<string, string>,
      volumes: Array<{ host: string; container: string; readonly?: boolean }>,
      workingDir: string
    ) => {
      const envFlags = Object.entries(envVars).flatMap(([k, v]) => ["-e", `${k}=${v}`]);
      const volumeFlags = volumes.flatMap(v =>
        ["-v", `${v.host}:${v.container}${v.readonly ? ":ro" : ""}`]
      );

      return Command.make(
        "docker", "run", "-d",
        "--name", name,
        ...envFlags,
        ...volumeFlags,
        "-w", workingDir,
        image,
        "sh", "-c", "exec sleep infinity"
      ).pipe(
        Command.string,
        Effect.map(output => output.trim()) // Returns container ID
      );
    };

    // Create a docker exec command (not executed yet)
    const makeExecCommand = (
      containerId: string,
      workingDir: string,
      command: string[]
    ) => {
      return Command.make(
        "docker", "exec",
        "-w", workingDir,
        containerId,
        ...command
      );
    };

    // Execute command and get exit code (for init commands)
    const execWithExitCode = (
      containerId: string,
      workingDir: string,
      command: string[]
    ) => {
      return makeExecCommand(containerId, workingDir, command).pipe(
        Command.exitCode
      );
    };

    // Download file inside container
    const downloadFile = (
      containerId: string,
      url: string,
      destination: string
    ) => {
      return Command.make(
        "docker", "exec",
        containerId,
        "curl", "-L", url, "-o", destination
      ).pipe(
        Command.exitCode,
        Effect.flatMap(exitCode =>
          exitCode === 0
            ? Effect.void
            : Effect.fail(new Error(`Failed to download ${url}`))
        )
      );
    };

    // Stop and remove container
    const stopContainer = (containerId: string) => {
      return Command.make("docker", "stop", containerId).pipe(
        Command.exitCode,
        Effect.flatMap(() =>
          Command.make("docker", "rm", containerId).pipe(
            Command.exitCode
          )
        ),
        Effect.asVoid
      );
    };

    // Check if container is running
    const isRunning = (containerId: string) => {
      return Command.make(
        "docker", "inspect",
        "--format", "{{.State.Running}}",
        containerId
      ).pipe(
        Command.string,
        Effect.map(output => output.trim() === "true"),
        Effect.catchAll(() => Effect.succeed(false))
      );
    };

    return {
      runContainer,
      makeExecCommand,
      execWithExitCode,
      downloadFile,
      stopContainer,
      isRunning
    } as const;
  }
}) { }
