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
Single service that manages everything.

```typescript
class EnvironmentManager {
  // Create environment (starts container)
  createEnvironment(config: EnvironmentConfig): Effect<void>;

  // Run command in environment
  runCommand(envId: string, command: string[]): Effect<string>; // returns commandId

  // Get command output (read from file)
  getOutput(cmdId: string): Effect<CommandOutput>;

  // Destroy environment (stops container)
  destroyEnvironment(envId: string): Effect<void>;

  // Get environment info (status, last activity, etc.)
  getEnvironmentInfo(envId: string): Effect<EnvironmentInfo | null>;
}

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
Manages a single container lifecycle.

```typescript
class Environment {
  private containerId: string;
  private config: EnvironmentConfig;
  private outputPath: string; // Resolved output path for this environment
  private lastActivityAt: Date;
  private commandQueue: Queue<CommandTask>; // Commands run sequentially
  private timeoutTimer?: NodeJS.Timeout;

  // Start container with volume mounts
  start(): Effect<void>;

  // Download files from URLs
  private downloadFiles(): Effect<void>;

  // Run initialization commands (fail environment if any command fails)
  private runInitCommands(): Effect<void>;

  // Execute command (returns commandId, queues for sequential execution)
  exec(command: string[]): Effect<string>;

  // Process command queue sequentially
  private processQueue(): Effect<void>;

  // Reset auto-cleanup timer
  private resetTimeout(): void;

  // Stop container
  stop(): Effect<void>;
}
```

### 2. OutputStorage (Internal)
Handles file I/O for command outputs.

```typescript
class OutputStorage {
  // Create files for command in specific directory
  initCommand(cmdId: string, outputPath: string): Effect<void>;

  // Write stdout/stderr as command executes
  writeStdout(cmdId: string, outputPath: string, data: string): Effect<void>;
  writeStderr(cmdId: string, outputPath: string, data: string): Effect<void>;

  // Read full output from specific directory
  readOutput(cmdId: string, outputPath: string): Effect<CommandOutput>;

  // Delete command files
  cleanup(cmdId: string, outputPath: string): Effect<void>;
}
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
Create output directory on host:
  - mkdir -p /var/outputs/workspace-123
           ↓
Docker run -d --name env-1 \
  -e TF_VAR_region=us-west-2 \
  -v /host/path/config.tf:/workspace/config.tf:ro \
  -v /host/path/vars:/workspace/vars:ro \
  tofu:1.8.0 sleep infinity
           ↓
[If init.fileFromUrl provided]
  Download files into container:
  - For each URL in files:
    - docker exec env-1 curl -L <url> -o <destination>/<filename>
           ↓
[If init.commands provided]
  Run init commands sequentially:
  - For each command:
    - docker exec -w /workspace env-1 sh -c "<command>"
    - If exit code != 0: FAIL and destroy container
           ↓
Start auto-cleanup timer (timeoutMs)
           ↓
Store containerId, outputPath, and timer in environments map
```

### 2. Run Command

```
Client: runCommand("env-1", ["tofu", "init"])
           ↓
Generate commandId: "cmd-abc123"
           ↓
Add to environment's command queue (sequential execution)
           ↓
[When queue processes this command]
Create output files in environment's outputPath:
  - /var/outputs/workspace-123/cmd-abc123.stdout
  - /var/outputs/workspace-123/cmd-abc123.stderr
           ↓
Docker exec -w /workspace env-1 tofu init
           ↓
Stream output to files in real-time
           ↓
Command completes → Record exit code
           ↓
Reset auto-cleanup timer (environment stays alive)
           ↓
Return commandId: "cmd-abc123"
```

### 3. Get Output

```
Client: getOutput("cmd-abc123")
           ↓
Lookup commandId to find its environment's outputPath
           ↓
Read /var/outputs/workspace-123/cmd-abc123.stdout
Read /var/outputs/workspace-123/cmd-abc123.stderr
           ↓
Return { stdout, stderr, exitCode }
```

### 4. Destroy Environment

```
Client: destroyEnvironment("env-1")
           ↓
Docker stop env-1 && docker rm env-1
           ↓
Remove from environments map
```

## File Structure

```
packages/spawner-v3/
├── src/
│   ├── index.ts                    # Export EnvironmentManager
│   ├── EnvironmentManager.ts       # Main service
│   ├── Environment.ts              # Single environment wrapper
│   └── OutputStorage.ts            # File I/O
```

## Configuration

```typescript
// Default output path if not specified in EnvironmentConfig
const DEFAULT_OUTPUT_BASE_PATH = "/tmp/spawner-outputs";

// Default auto-cleanup timeout (5 minutes of inactivity)
const DEFAULT_TIMEOUT_MS = 300000;

// When outputPath is not provided in config:
// outputPath = `${DEFAULT_OUTPUT_BASE_PATH}/${envId}`

// When timeoutMs is not provided in config:
// timeoutMs = DEFAULT_TIMEOUT_MS
```

## Usage Example

```typescript
import { EnvironmentManager } from "@open-bento/spawner-v3";

const manager = EnvironmentManager.make();

// 1. Create environment with init, env vars, and custom output path
await Effect.runPromise(
  manager.createEnvironment({
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
  })
);

// Or minimal config with defaults (auto-cleanup after 5min)
await Effect.runPromise(
  manager.createEnvironment({
    id: "env-simple",
    image: "tofu:1.8.0"
  })
);

// Custom timeout (auto-cleanup after 1 hour)
await Effect.runPromise(
  manager.createEnvironment({
    id: "env-long-running",
    image: "tofu:1.8.0",
    timeoutMs: 3600000 // 1 hour
  })
);

// 2. Run commands (all execute in /workspace with env vars)
const cmdId1 = await Effect.runPromise(
  manager.runCommand("env-workspace-123", ["tofu", "init"])
);

const cmdId2 = await Effect.runPromise(
  manager.runCommand("env-workspace-123", ["tofu", "plan", "-out=plan.tfplan"])
);

// 3. Get output
const output1 = await Effect.runPromise(
  manager.getOutput(cmdId1)
);
console.log(output1.stdout);
console.log(output1.exitCode);

const output2 = await Effect.runPromise(
  manager.getOutput(cmdId2)
);

// 4. Cleanup
await Effect.runPromise(
  manager.destroyEnvironment("env-workspace-123")
);
```

## Benefits

1. **Persistent State** - Filesystem persists between commands
2. **Resource Efficiency** - Reuse containers instead of creating/destroying
3. **Simple Output** - All output in files, easy to retrieve anytime
4. **Sequential Commands** - Run multiple commands in same context

## Implementation Steps

1. Implement `OutputStorage` (file read/write)
2. Implement `Environment` (docker run/exec wrapper)
3. Implement `EnvironmentManager` (main API)
4. Test with basic tofu commands

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
- Downloads each URL: `docker exec env-1 curl -L '<url>' -o <destination>/<filename>`
- Presigned URLs (S3, GCS, Azure) work directly

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
  cmd-xyz789.stdout
  cmd-xyz789.stderr
  ...
```

Example with custom path:
```
/mnt/outputs/workspace-123/
  cmd-001.stdout
  cmd-001.stderr
  cmd-002.stdout
  cmd-002.stderr
```

Example with default path:
```
/tmp/spawner-outputs/env-workspace-123/
  cmd-001.stdout
  cmd-001.stderr
```

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
- Timer resets on every command execution
- Manual cleanup via `destroyEnvironment()` still available
- Prevents orphaned containers from consuming resources

### Docker Image Handling
Docker images are **pulled automatically** if not present locally.
- No need to pre-pull images
- First environment creation may be slower
- Subsequent environments reuse cached image

### Output Path Creation
Parent directories for `outputPath` are **created automatically**.
- No need to pre-create directories
- Uses `mkdir -p` behavior

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
