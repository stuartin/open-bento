# @open-bento/spawner-v3

A robust job spawner and runner for executing containerized infrastructure-as-code tools (OpenTofu/Terraform) with concurrency control, logging, and lifecycle management.

## Overview

spawner-v3 is a TypeScript package built with Effect-TS that manages the execution of infrastructure-as-code runs in isolated Docker containers. It provides:

- Concurrent job execution with configurable limits
- Automatic Docker image building and caching
- Real-time log streaming
- Status tracking and callbacks
- Proper resource cleanup and lifecycle management

## Architecture

The package follows a service-oriented architecture using Effect-TS patterns:

```
┌─────────────┐
│   Spawner   │  (Singleton, Main Entry Point)
└──────┬──────┘
       │
       ├──────────────────────────────────┐
       │                                   │
┌──────▼──────┐                    ┌──────▼──────┐
│  RunRunner  │◄───────────────────┤   Config    │
└──────┬──────┘                    └─────────────┘
       │
       │
┌──────▼──────┐
│   Docker    │
└─────────────┘
```

### Core Components

#### 1. Spawner ([Spawner.ts](src/Spawner.ts))
The main singleton class that orchestrates the entire system. It:
- Manages the Effect runtime and dependency injection
- Provides the public API for queueing runs
- Handles configuration and callbacks
- Controls the lifecycle of all services

**Key Methods:**
- `get(config?: SpawnerConfig)` - Get/create singleton instance
- `start()` - Start the run processing loop
- `queueRun(run: Run)` - Add a run to the execution queue
- `dispose()` - Clean up resources

#### 2. RunRunner ([src/services/RunRunner.ts](src/services/RunRunner.ts))
The core execution engine that:
- Maintains a bounded queue of pending runs (capacity: 100)
- Controls concurrency via semaphore (default: 5 concurrent runs)
- Manages the complete run lifecycle:
  1. Check if Docker image exists
  2. Build image if needed (using OpenTofu base images)
  3. Execute container with proper environment variables
  4. Stream logs in batches of 50 lines
  5. Handle errors and update status
  6. Cleanup resources via Effect scopes

**Run Lifecycle:**
```
queued → started → (building image if needed) → running → success/error
```

#### 3. Docker ([src/services/Docker.ts](src/services/Docker.ts))
Wraps Docker CLI operations as Effect commands:
- `imageExists(tag)` - Check if an image exists locally
- `buildImage(tag, dockerfilePath, contextPath)` - Build a Docker image
- `runContainer(name, image, args, env)` - Run a container and stream output

All operations return Effect streams or effects for composability.

#### 4. Config ([src/services/Config.ts](src/services/Config.ts))
Manages environment-based configuration:
- `MAX_CONCURRENT_RUNS` - Maximum parallel executions (default: 5)

#### 5. Tofu Dockerfile ([src/lib/tofu-dockerfile.ts](src/lib/tofu-dockerfile.ts))
Generates Dockerfiles for OpenTofu containers:
- Uses official OpenTofu minimal images as base
- Adds git and curl utilities
- Configures tofu as entrypoint

## How It Works

### 1. Initialization
```typescript
const spawner = await Spawner.get({
  onStatusUpdate: async (runId, status) => {
    // Called when run status changes
  },
  onLogs: async (runId, logs) => {
    // Called with batches of log lines
  }
});
```

### 2. Starting the Runner
```typescript
spawner.start(); // Begins processing queued runs
```

### 3. Queueing a Run
```typescript
await spawner.queueRun({
  id: "run-123",
  workspaceId: "workspace-456",
  tool: "tofu",
  toolVersion: "1.6.0"
});
```

### 4. Execution Flow

1. Run is added to bounded queue
2. RunRunner picks up run when semaphore permits
3. Status updated to "started"
4. Image check: Does `tofu:1.6.0` exist?
   - If NO: Create temp directory, generate Dockerfile, build image
   - If YES: Skip to next step
5. Status updated to "running"
6. Container executed with:
   - Name: `{runId}`
   - Environment: `RUN_ID`, `WORKSPACE_ID`
   - Command: `tofu version -json`
   - Flags: `--rm` (auto-remove)
7. Logs streamed in chunks of 50 lines via callback
8. On completion: Status updated to "success" or "error"
9. Resources cleaned up via Effect scoped finalizers

### 5. Cleanup
```typescript
await spawner.dispose(); // Releases all resources
```

## Configuration

### Environment Variables
- `MAX_CONCURRENT_RUNS` - Maximum number of runs executing simultaneously (default: 5)

### Spawner Config
```typescript
interface SpawnerConfig {
  onStatusUpdate: (runId: string, status: RunStatus) => Promise<void>;
  onLogs: (runId: string, logs: string[]) => Promise<void>;
}
```

Where `RunStatus` is: `"started" | "running" | "success" | "error"`

## Dependencies

### Runtime Dependencies
- **effect** (^3.21.2) - Functional effect system for TypeScript
- **@effect/platform** (^0.96.1) - Platform abstractions
- **@effect/platform-node** (^0.106.0) - Node.js implementations
- **@open-bento/types** - Shared types for Open Bento
- **zod** - Schema validation

### System Dependencies
- **Docker** - Must be installed and accessible via CLI
- **Sysbox** (optional) - Commented out but intended for nested containers

## Technical Stack

- **Effect-TS** - Core functional programming framework
  - Services for dependency injection
  - Queue for job management
  - Command for subprocess execution
  - Scopes for resource lifecycle
  - Stream for log processing
- **Docker** - Container runtime
- **TypeScript** - Type-safe development

## Key Features

### Concurrency Control
Uses Effect's `Semaphore` to limit concurrent executions, preventing resource exhaustion.

### Automatic Image Building
Lazy image creation - only builds Docker images when needed, then caches them.

### Structured Logging
Logs are streamed in real-time, batched (50 lines), and delivered via callback for external persistence.

### Resource Safety
Effect scopes ensure proper cleanup even on errors:
- Temporary directories auto-deleted
- Containers removed via `--rm` flag
- Runtime disposed cleanly

### Error Handling
Comprehensive error recovery:
- Failed builds caught and reported
- Container failures update status to "error"
- Errors logged with context
- Queue continues processing other runs

## Usage Example

```typescript
import { Spawner } from "@open-bento/spawner-v3";

// Initialize
const spawner = await Spawner.get({
  onStatusUpdate: async (runId, status) => {
    console.log(`Run ${runId} status: ${status}`);
    // Update database, notify users, etc.
  },
  onLogs: async (runId, logs) => {
    console.log(`Run ${runId} logs:`, logs.join('\n'));
    // Store in database, stream to client, etc.
  }
});

// Start processing
spawner.start();

// Queue runs
await spawner.queueRun({
  id: "run-001",
  workspaceId: "ws-001",
  tool: "tofu",
  toolVersion: "1.8.7"
});

await spawner.queueRun({
  id: "run-002",
  workspaceId: "ws-001",
  tool: "tofu",
  toolVersion: "1.8.7"
});

// Later...
await spawner.dispose();
```

## File Structure

```
packages/spawner-v3/
├── src/
│   ├── index.ts              # Public exports
│   ├── Spawner.ts            # Main singleton orchestrator
│   ├── services/
│   │   ├── RunRunner.ts      # Job execution engine
│   │   ├── Docker.ts         # Docker CLI wrapper
│   │   └── Config.ts         # Configuration service
│   └── lib/
│       └── tofu-dockerfile.ts # Dockerfile generator
├── package.json
├── tsconfig.json
├── biome.json                # Linting config
└── README.md
```

## Development

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run check
```

## Notes

- The current implementation runs `tofu version -json` as a test command
- Sysbox runtime is commented out but can be enabled for nested container support
- Logs are batched in groups of 50 for efficiency
- Queue capacity is hardcoded to 100 pending runs
- All Docker operations use the CLI (not Docker API)
