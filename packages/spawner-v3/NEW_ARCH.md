# New Architecture: Environment-Based Execution (Minimal)

## Overview

Move from a run-based model to an environment-based model where each environment is a long-lived isolated context that can execute multiple commands.

## Key Concepts

### Environment
An isolated Docker container that:
- Has a unique ID
- Persists for multiple command executions
- Maintains filesystem state between commands
- Stores all output to persistent files

### Command Execution
Each command execution within an environment:
- Has a unique command ID
- Runs in the context of its parent environment
- Writes stdout/stderr to dedicated log files
- Doesn't destroy the environment on completion

## Architecture

```
┌─────────────────────┐
│  EnvironmentManager │  (Main Service)
└──────────┬──────────┘
           │
           ├─────────────────────┐
           │                     │
    ┌──────▼──────┐      ┌──────▼────────┐
    │ Environment │      │ OutputStorage │
    │ (Map by ID) │      │  (Files)      │
    └─────────────┘      └───────────────┘
```

## Minimal API

### EnvironmentManager
Single service that manages everything, defined using Effect service patterns.

```typescript
import { Effect } from "effect";

// EnvironmentManager service using Effect.Service pattern
class EnvironmentManager extends Effect.Service<EnvironmentManager>()("spawner/EnvironmentManager", {
  effect: Effect.gen(function* () {
    const docker = yield* Docker;
    const storage = yield* OutputStorage;

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
        const outputPath = config.outputPath ?? `/tmp/spawner-outputs/${config.id}`;
        yield* storage.initCommand(config.id, outputPath);

        // Start container using Docker service
        const containerId = yield* docker.runContainer(
          config.id,
          config.image,
          config.env ?? {},
          [], // volumes from config.init.filesFromPath
          config.workingDir ?? "/workspace"
        );

        // Download files if specified
        if (config.init?.fileFromUrl) {
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

        // Store environment
        // Implementation details...
      });

    const runCommand = (envId: string, command: string[]) =>
      Effect.gen(function* () {
        const env = environments.get(envId);
        if (!env) {
          yield* Effect.fail(new Error(`Environment not found: ${envId}`));
        }

        const cmdId = `cmd-${Date.now()}`;
        commandToEnv.set(cmdId, envId);

        // Queue command for execution
        // Implementation details...

        return cmdId;
      });

    const getOutput = (cmdId: string) =>
      Effect.gen(function* () {
        const envId = commandToEnv.get(cmdId);
        if (!envId) {
          yield* Effect.fail(new Error(`Command not found: ${cmdId}`));
        }

        const env = environments.get(envId);
        if (!env) {
          yield* Effect.fail(new Error(`Environment not found: ${envId}`));
        }

        return yield* storage.readOutput(cmdId, env.outputPath);
      });

    const destroyEnvironment = (envId: string) =>
      Effect.gen(function* () {
        const env = environments.get(envId);
        if (!env) {
          yield* Effect.fail(new Error(`Environment not found: ${envId}`));
        }

        yield* docker.stopContainer(env.containerId);
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

export { EnvironmentManager };


interface EnvironmentInfo {
  id: string;
  status: "starting" | "ready" | "busy" | "failed";
  lastActivityAt: Date;
  commandCount: number;
}

interface EnvironmentConfig {
  id: string;
  image: string; // Docker image to use (e.g., "tofu:1.8.0")
  env?: Record<string, string>; // Environment variables for all commands
  outputPath?: string; // Where to store command outputs (default: /tmp/spawner-outputs/{envId})
  workingDir?: string; // Working directory for commands (default: /workspace)
  timeoutMs?: number; // Auto-destroy after this many ms of inactivity (default: 300000 = 5min)
  init?: {
    filesFromPath?: { files: string[]; destination: string }; // Mount host files/folders (read-only)
    fileFromUrl?: { files: string[]; destination: string }; // Download files from URLs
    commands?: string[]; // Init commands (e.g., untar, setup, etc.)
  };
}

interface CommandOutput {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}
```

## Core Components (Internal)

### 1. Environment (Internal)
Manages a single container lifecycle using Effect Commands.

```typescript
class Environment {
  private containerId: string;
  private config: EnvironmentConfig;
  private outputPath: string; // Resolved output path for this environment
  private workingDir: string; // Resolved working directory
  private lastActivityAt: Date;
  private commandQueue: Queue<CommandTask>; // Commands run sequentially
  private cleanupSchedule: Effect.Schedule; // Effect-based timeout scheduling

  // Start container with volume mounts using Effect Command
  start(): Effect<void>;
  // Implementation: Command.make("docker", "run", "-d", ...args)

  // Download files from URLs using Effect Command
  private downloadFiles(): Effect<void>;
  // Implementation: Command.make("docker", "exec", containerId, "curl", "-L", url, "-o", destination)

  // Run initialization commands (fail environment if any command fails)
  private runInitCommands(): Effect<void>;
  // Implementation: Command.make("docker", "exec", "-w", workingDir, containerId, "sh", "-c", cmd)

  // Execute command (returns commandId immediately, queues for execution)
  exec(command: string[]): Effect<string>;
  // Implementation: Command.make("docker", "exec", "-w", workingDir, containerId, ...command)
  //                  .pipe(Command.stream) for streaming output to files

  // Process command queue sequentially
  private processQueue(): Effect<void>;

  // Reset auto-cleanup schedule
  private resetTimeout(): Effect<void>;

  // Stop container using Effect Command
  stop(): Effect<void>;
  // Implementation: Command.make("docker", "stop", containerId)
  //                 >> Command.make("docker", "rm", containerId)
}
```

### 2. OutputStorage (Service)
Handles file I/O for command outputs using Effect FileSystem.

```typescript
import { FileSystem } from "@effect/platform/FileSystem";
import { NodeFileSystem } from "@effect/platform-node/NodeFileSystem";
import { Path } from "@effect/platform/Path";
import { Effect } from "effect";

// OutputStorage service using Effect.Service pattern
class OutputStorage extends Effect.Service<OutputStorage>()("spawner/OutputStorage", {
  effect: Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const initCommand = (cmdId: string, outputPath: string) =>
      Effect.gen(function* () {
        const stdoutPath = path.join(outputPath, `${cmdId}.stdout`);
        const stderrPath = path.join(outputPath, `${cmdId}.stderr`);
        const exitcodePath = path.join(outputPath, `${cmdId}.exitcode`);

        yield* fs.writeFileString(stdoutPath, "");
        yield* fs.writeFileString(stderrPath, "");
        yield* fs.writeFileString(exitcodePath, "null");
      });

    const writeStdout = (cmdId: string, outputPath: string, data: string) =>
      Effect.gen(function* () {
        const stdoutPath = path.join(outputPath, `${cmdId}.stdout`);
        yield* fs.appendFileString(stdoutPath, data);
      });

    const writeStderr = (cmdId: string, outputPath: string, data: string) =>
      Effect.gen(function* () {
        const stderrPath = path.join(outputPath, `${cmdId}.stderr`);
        yield* fs.appendFileString(stderrPath, data);
      });

    const readOutput = (cmdId: string, outputPath: string) =>
      Effect.gen(function* () {
        const stdoutPath = path.join(outputPath, `${cmdId}.stdout`);
        const stderrPath = path.join(outputPath, `${cmdId}.stderr`);
        const exitcodePath = path.join(outputPath, `${cmdId}.exitcode`);

        const [stdout, stderr, exitCodeStr] = yield* Effect.all([
          fs.readFileString(stdoutPath),
          fs.readFileString(stderrPath),
          fs.readFileString(exitcodePath)
        ]);

        const exitCode = exitCodeStr === "null" ? null : Number.parseInt(exitCodeStr);

        return { stdout, stderr, exitCode };
      });

    const cleanup = (cmdId: string, outputPath: string) =>
      Effect.gen(function* () {
        const stdoutPath = path.join(outputPath, `${cmdId}.stdout`);
        const stderrPath = path.join(outputPath, `${cmdId}.stderr`);
        const exitcodePath = path.join(outputPath, `${cmdId}.exitcode`);

        yield* Effect.all([
          fs.remove(stdoutPath),
          fs.remove(stderrPath),
          fs.remove(exitcodePath)
        ], { concurrency: "unbounded" });
      });

    return {
      initCommand,
      writeStdout,
      writeStderr,
      readOutput,
      cleanup
    } as const;
  }),
  dependencies: [NodeFileSystem.layer]
}) {}

export { OutputStorage };
```

## Data Flow

### 1. Create Environment

```
Client: createEnvironment({
  id: "env-1",
  image: "tofu:1.8.0",
  env: { TF_VAR_region: "us-west-2" },
  outputPath: "/var/outputs/workspace-123",
  init: {
    filesFromPath: {
      files: ["/host/path/config.tf", "/host/path/vars"],
      destination: "/workspace"
    },
    fileFromUrl: {
      files: ["https://s3.amazonaws.com/bucket/modules.tar.gz?sig=..."],
      destination: "/workspace/modules"
    },
    commands: [
      "tar -xzf /workspace/modules/modules.tar.gz -C /workspace/modules",
      "rm /workspace/modules/modules.tar.gz"
    ]
  }
})
           ↓
Create output directory on host using Effect FileSystem:
  - FileSystem.makeDirectory("/var/outputs/workspace-123", { recursive: true })
           ↓
Start container using Effect Command:
  - Docker.runContainer("env-1", "tofu:1.8.0", envVars, volumes, "/workspace")
  - Command.make("docker", "run", "-d", "--name", "env-1",
      "-e", "TF_VAR_region=us-west-2",
      "-v", "/host/path/config.tf:/workspace/config.tf:ro",
      "-v", "/host/path/vars:/workspace/vars:ro",
      "tofu:1.8.0", "sh", "-c", "exec sleep infinity")
  - Returns containerId
           ↓
[If init.fileFromUrl provided]
  Download files into container using Effect Commands:
  - For each URL in files:
    - Docker.downloadFile(containerId, url, destination)
    - Command.make("docker", "exec", "env-1", "curl", "-L", url, "-o", destination)
           ↓
[If init.commands provided]
  Run init commands sequentially using Effect Commands:
  - For each command:
    - Docker.execWithExitCode(containerId, "/workspace", ["sh", "-c", command])
    - If exitCode !== 0: Effect.fail and destroy container
           ↓
Start auto-cleanup schedule using Effect:
  - Schedule.once(Duration.millis(timeoutMs))
           ↓
Store containerId, outputPath, and schedule in environments map
```

### 2. Run Command

```
Client: runCommand("env-1", ["tofu", "init"])
           ↓
Generate commandId: "cmd-abc123"
           ↓
Return commandId immediately: "cmd-abc123"
           ↓
Add to environment's command queue (sequential execution)
           ↓
[Asynchronously, when queue processes this command]
Create output files in environment's outputPath using Effect FileSystem:
  - OutputStorage.initCommand("cmd-abc123", "/var/outputs/workspace-123")
  - Creates: cmd-abc123.stdout, cmd-abc123.stderr, cmd-abc123.exitcode
           ↓
Execute command using Effect Command and stream output:
  - Docker.exec(containerId, "/workspace", ["tofu", "init"])
  - Command.make("docker", "exec", "-w", "/workspace", "env-1", "tofu", "init")
    .pipe(Command.stream)
           ↓
Stream output to files in real-time using Effect Streams:
  - Stream.run(outputStream, Sink.toFile(stdoutPath))
  - Stream.run(errorStream, Sink.toFile(stderrPath))
           ↓
Command completes → Record exit code to file:
  - FileSystem.writeFileString(exitcodePath, exitCode.toString())
           ↓
Reset auto-cleanup schedule using Effect:
  - Schedule.restart(environment stays alive)
           ↓
Process next command in queue
```

### 3. Get Output

```
Client: getOutput("cmd-abc123")
           ↓
Lookup commandId in commandToEnv map to find environment
           ↓
Get environment's outputPath
           ↓
Read files using Effect FileSystem:
  - FileSystem.readFileString("/var/outputs/workspace-123/cmd-abc123.stdout")
  - FileSystem.readFileString("/var/outputs/workspace-123/cmd-abc123.stderr")
  - FileSystem.readFileString("/var/outputs/workspace-123/cmd-abc123.exitcode")
           ↓
Return { stdout, stderr, exitCode }
```

### 4. Destroy Environment

```
Client: destroyEnvironment("env-1")
           ↓
Cancel auto-cleanup schedule using Effect:
  - Effect.interrupt(scheduleTask)
           ↓
Stop and remove container using Effect Commands:
  - Docker.stopContainer(containerId)
  - Command.make("docker", "stop", "env-1")
    >> Command.make("docker", "rm", "env-1")
           ↓
Remove from environments map
           ↓
Remove commandId mappings for this environment
           ↓
Output files preserved on host (not deleted)
```

## File Structure

```
packages/spawner-v3/
├── src/
│   ├── index.ts                    # Export EnvironmentManager
│   ├── EnvironmentManager.ts       # Main service
│   ├── Environment.ts              # Single environment wrapper
│   ├── OutputStorage.ts            # File I/O
│   └── services/
│       └── Docker.ts               # Docker CLI wrapper using Effect Commands
```

## Configuration

```typescript
// Default output path if not specified in EnvironmentConfig
const DEFAULT_OUTPUT_BASE_PATH = "/tmp/spawner-outputs";

// Default working directory if not specified in EnvironmentConfig
const DEFAULT_WORKING_DIR = "/workspace";

// Default auto-cleanup timeout (5 minutes of inactivity)
const DEFAULT_TIMEOUT_MS = 300000;

// Maximum concurrent environments
const MAX_CONCURRENT_ENVIRONMENTS = 50;

// When outputPath is not provided in config:
// outputPath = `${DEFAULT_OUTPUT_BASE_PATH}/${envId}`

// When workingDir is not provided in config:
// workingDir = DEFAULT_WORKING_DIR

// When timeoutMs is not provided in config:
// timeoutMs = DEFAULT_TIMEOUT_MS
```

## Dependencies

### Required Packages
```json
{
  "dependencies": {
    "effect": "^3.21.2",
    "@effect/platform": "^0.96.1",
    "@effect/platform-node": "^0.106.0"
  }
}
```

### System Requirements
- **Docker** - Must be installed and accessible via CLI
- **Node.js** - v18+ for Effect-TS compatibility

## Usage Example

```typescript
import { EnvironmentManager } from "@open-bento/spawner-v3";
import { Effect } from "effect";
import { NodeContext } from "@effect/platform-node/NodeContext";

// Define the program using the EnvironmentManager service
const program = Effect.gen(function* () {
  const manager = yield* EnvironmentManager;

  // 1. Create environment with init, env vars, and custom output path
  yield* manager.createEnvironment({
    id: "env-workspace-123",
    image: "tofu:1.8.0",
    outputPath: "/mnt/outputs/workspace-123",
    env: {
      TF_VAR_region: "us-west-2",
      TF_VAR_environment: "production",
      AWS_PROFILE: "default"
    },
    init: {
      // Mount host files/folders into container
      filesFromPath: {
        files: ["/host/configs/main.tf", "/host/configs/modules"],
        destination: "/workspace"
      },
      // Download files from presigned URLs
      fileFromUrl: {
        files: [
          "https://s3.amazonaws.com/bucket/tfstate.tar.gz?X-Amz-Signature=...",
          "https://s3.amazonaws.com/bucket/providers.zip?X-Amz-Signature=..."
        ],
        destination: "/workspace/downloads"
      },
      // Run init commands
      commands: [
        "mkdir -p /workspace/state",
        "tar -xzf /workspace/downloads/tfstate.tar.gz -C /workspace/state",
        "unzip -q /workspace/downloads/providers.zip -d /workspace/.terraform"
      ]
    }
  });

  // Or minimal config with defaults (auto-cleanup after 5min)
  yield* manager.createEnvironment({
    id: "env-simple",
    image: "tofu:1.8.0"
  });

  // Custom timeout (auto-cleanup after 1 hour)
  yield* manager.createEnvironment({
    id: "env-long-running",
    image: "tofu:1.8.0",
    timeoutMs: 3600000 // 1 hour
  });

  // 2. Run commands (all execute in /workspace with env vars)
  const cmdId1 = yield* manager.runCommand("env-workspace-123", ["tofu", "init"]);
  const cmdId2 = yield* manager.runCommand("env-workspace-123", ["tofu", "plan", "-out=plan.tfplan"]);

  // 3. Get output
  const output1 = yield* manager.getOutput(cmdId1);
  console.log(output1.stdout);
  console.log(output1.exitCode);

  const output2 = yield* manager.getOutput(cmdId2);

  // 4. Cleanup
  yield* manager.destroyEnvironment("env-workspace-123");
});

// Provide all required layers and run
// EnvironmentManager.Default automatically includes Docker.Default and OutputStorage.Default
const runnable = program.pipe(
  Effect.provide(EnvironmentManager.Default),
  Effect.provide(NodeContext.layer)
);

Effect.runPromise(runnable);
```

## Benefits

1. **Persistent State** - Filesystem persists between commands
2. **Resource Efficiency** - Reuse containers instead of creating/destroying
3. **Simple Output** - All output in files, easy to retrieve anytime
4. **Sequential Commands** - Run multiple commands in same context
5. **Effect Commands Integration** - Composable, type-safe process execution
6. **Streaming Output** - Real-time output capture using Effect Streams
7. **Error Handling** - Built-in error handling through Effect's type system
8. **Platform Abstraction** - Effect Platform provides cross-platform compatibility

## Docker Service (Effect Commands)

### Docker.ts
Wraps Docker CLI operations as Effect Commands for composability.

```typescript
import { Command } from "@effect/platform/Command";
import { Effect, Stream } from "effect";

// Docker service using Effect.Service pattern
class Docker extends Effect.Service<Docker>()("spawner/Docker", {
  sync: () => {
    // Start a container with volume mounts
    const runContainer = (
      name: string,
      image: string,
      envVars: Record<string, string>,
      volumes: Array<{ host: string; container: string; readonly?: boolean }>,
      workingDir: string
    ): Effect.Effect<string> => {
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

    // Execute command inside container and stream output
    const exec = (
      containerId: string,
      workingDir: string,
      command: string[]
    ): Stream.Stream<Uint8Array> => {
      return Command.make(
        "docker", "exec",
        "-w", workingDir,
        containerId,
        ...command
      ).pipe(Command.stream);
    };

    // Execute command and get exit code
    const execWithExitCode = (
      containerId: string,
      workingDir: string,
      command: string[]
    ): Effect.Effect<number> => {
      return Command.make(
        "docker", "exec",
        "-w", workingDir,
        containerId,
        ...command
      ).pipe(Command.exitCode);
    };

    // Download file inside container
    const downloadFile = (
      containerId: string,
      url: string,
      destination: string
    ): Effect.Effect<void> => {
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
    const stopContainer = (containerId: string): Effect.Effect<void> => {
      return Command.make("docker", "stop", containerId).pipe(
        Command.exitCode,
        Effect.flatMap(() => Command.make("docker", "rm", containerId)),
        Effect.flatMap(cmd => cmd.pipe(Command.exitCode)),
        Effect.asVoid
      );
    };

    // Check if container is running
    const isRunning = (containerId: string): Effect.Effect<boolean> => {
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
      exec,
      execWithExitCode,
      downloadFile,
      stopContainer,
      isRunning
    } as const;
  }
}) {}

export { Docker };
```

## Implementation Steps

1. Implement `Docker` service (Effect Commands wrapper)
2. Implement `OutputStorage` (file read/write using Effect filesystem operations)
3. Implement `Environment` (uses Docker service for container lifecycle)
4. Implement `EnvironmentManager` (main API)
5. Test with basic tofu commands

## Init Configuration

The `init` field provides flexible initialization for environments.

### filesFromPath
Mount host files/folders into the container (read-only by default).

```typescript
filesFromPath: {
  files: [
    "/host/path/file.txt",      // Single file
    "/host/path/directory"       // Entire directory
  ],
  destination: "/workspace"      // Container path
}
```

**Implementation:**
- Files are mounted via Docker volumes: `-v /host/path/file.txt:/workspace/file.txt:ro`
- **Read-only mounts** prevent container from modifying host files
- Directories are mounted recursively
- Alternative: Copy files instead of mounting (allows container modifications without affecting host)

**File vs Directory Handling:**
- Implementation must detect if path is file or directory
- File: `/host/config.tf` + destination `/workspace` → mount to `/workspace/config.tf`
- Directory: `/host/modules` + destination `/workspace` → mount to `/workspace/modules`
- Use `fs.stat()` to check if path is file or directory before mounting

### fileFromUrl
Download files from presigned URLs into the container.

```typescript
fileFromUrl: {
  files: [
    "https://s3.amazonaws.com/bucket/file.tar.gz?X-Amz-Signature=...",
    "https://storage.googleapis.com/bucket/config.zip?token=..."
  ],
  destination: "/workspace/downloads"
}
```

**Implementation:**
- Creates destination directory if needed
- Downloads each URL: `docker exec env-1 curl -L '<url>' -o <destination>`
- **Filename from destination**: The `files` array should include full destination paths with filenames
- Presigned URLs (S3, GCS, Azure) work directly

**Example:**
```typescript
fileFromUrl: {
  files: [
    "https://s3.../file.tar.gz?sig=..."  // URL
  ],
  destination: "/workspace/downloads/file.tar.gz"  // Full path with filename
}
// Downloads to: /workspace/downloads/file.tar.gz
```

### commands
Run initialization commands after mounting/downloading files.

```typescript
commands: [
  "tar -xzf /workspace/downloads/archive.tar.gz -C /workspace",
  "chmod +x /workspace/scripts/setup.sh",
  "/workspace/scripts/setup.sh"
]
```

**Implementation:**
- Executes sequentially: `docker exec -w /workspace env-1 sh -c "<command>"`
- Runs in `/workspace` working directory
- **Fails fast** - if any init command fails, environment creation fails and container is destroyed

## Output File Organization

Each environment's command outputs are stored in its dedicated directory:

```
{outputPath}/
  cmd-abc123.stdout
  cmd-abc123.stderr
  cmd-abc123.exitcode
  cmd-xyz789.stdout
  cmd-xyz789.stderr
  cmd-xyz789.exitcode
  ...
```

Example with custom path:
```
/mnt/outputs/workspace-123/
  cmd-001.stdout
  cmd-001.stderr
  cmd-001.exitcode
  cmd-002.stdout
  cmd-002.stderr
  cmd-002.exitcode
```

Example with default path:
```
/tmp/spawner-outputs/env-workspace-123/
  cmd-001.stdout
  cmd-001.stderr
  cmd-001.exitcode
```

**Note:** Output files are preserved when environment is destroyed. This allows retrieving command results even after container cleanup.

## Init Examples

### Example 1: Mount local configs and download state
```typescript
init: {
  filesFromPath: {
    files: ["/local/terraform/main.tf"],
    destination: "/workspace"
  },
  fileFromUrl: {
    files: ["https://s3.../terraform.tfstate?sig=..."],
    destination: "/workspace"
  }
}
// Result: /workspace/main.tf (mounted), /workspace/terraform.tfstate (downloaded)
```

### Example 2: Download archive and extract
```typescript
init: {
  fileFromUrl: {
    files: ["https://s3.../workspace.tar.gz?sig=..."],
    destination: "/tmp"
  },
  commands: [
    "tar -xzf /tmp/workspace.tar.gz -C /workspace",
    "rm /tmp/workspace.tar.gz"
  ]
}
```

### Example 3: Mount entire directory
```typescript
init: {
  filesFromPath: {
    files: ["/local/project"],
    destination: "/workspace"
  }
}
// Result: /workspace mirrors /local/project
```

## Design Decisions

### Sequential Command Execution
Commands within an environment run **sequentially** (one at a time). This ensures:
- Predictable state between commands
- No race conditions on shared files
- Easier debugging and log interpretation

### Auto-Cleanup
Environments auto-destroy after `timeoutMs` milliseconds of inactivity (default: 5 minutes).
- Uses Effect's scheduling primitives for timeout management
- Schedule resets on every command execution
- Manual cleanup via `destroyEnvironment()` still available
- Prevents orphaned containers from consuming resources

### Environment Concurrency Limit
Maximum of `MAX_CONCURRENT_ENVIRONMENTS` (default: 50) can exist simultaneously.
- `createEnvironment()` fails if limit reached
- Auto-cleanup helps free slots
- Prevents resource exhaustion

### Docker Image Handling
Docker images are **pulled automatically** if not present locally.
- No need to pre-pull images
- First environment creation may be slower
- Subsequent environments reuse cached image

### Output Path Creation
Parent directories for `outputPath` are **created automatically**.
- No need to pre-create directories
- Uses `mkdir -p` behavior

### Working Directory
Commands execute in `workingDir` (default: `/workspace`).
- Directory created automatically during container start
- Configurable per environment via `workingDir` in config
- Init commands also run in this directory

### File Mounting
Files from `filesFromPath` are mounted **read-only**.
- Prevents accidental host file modification
- Container cannot corrupt source files
- Alternative: Copy files if write access needed

### Init Failure Handling
If any init command fails, **environment creation fails**.
- Container is immediately destroyed
- `createEnvironment()` returns error
- No partial/broken environments left running
