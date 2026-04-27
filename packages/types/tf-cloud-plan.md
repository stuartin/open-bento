# Terraform Cloud CLI Compatibility Contract

A comprehensive oRPC contract for implementing Terraform Cloud API compatibility, enabling full support for Terraform/OpenTofu CLI operations.

## Overview

This contract provides:

- **Clean internal API** (not JSON:API format)
- **Full CLI support**: `terraform login`, `init`, `plan`, `apply`
- **Multi-tenant architecture** with scoped tokens
- **Mappable REST endpoints** for Terraform compatibility

---

## Implementation Status

| Domain   | Status | CLI Commands              |
|----------|--------|---------------------------|
| `auth`   | ✅ Implemented | `terraform login`         |
| `orgs`   | 🔲 TODO | `terraform init`          |
| `state`  | 🔲 TODO | `terraform init`, `apply` |
| `config` | 🔲 TODO | `terraform plan`, `apply` |
| `runs`   | 🔲 TODO | `terraform plan`, `apply` |
| `logs`   | 🔲 TODO | `terraform plan`, `apply` |

---

## Auth (✅ Implemented)

Authentication is implemented using **better-auth** with the `oauthProvider` plugin, supporting OAuth2 Authorization Code flow.

### Implementation Details

**Stack:**
- `better-auth` v1.6.9 with `@better-auth/oauth-provider`
- JWT plugin for token generation
- SQLite database via Drizzle ORM

**Files:**
- `apps/website/src/lib/server/auth/index.ts` - better-auth configuration
- `apps/website/src/routes/.well-known/terraform.json/+server.ts` - Service discovery
- `apps/website/src/routes/.well-known/openid-configuration/[...issuerPath]/+server.ts` - OIDC metadata
- `apps/website/src/routes/.well-known/oauth-authorization-server/[...issuerPath]/+server.ts` - OAuth metadata
- `apps/website/src/hooks.server.ts` - OAuth client initialization
- `apps/website/src/routes/auth/login/+page.server.ts` - Login flow with OAuth redirect

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/.well-known/terraform.json` | GET | Service discovery for Terraform CLI |
| `/.well-known/openid-configuration/api/v1/auth` | GET | OpenID Connect metadata |
| `/.well-known/oauth-authorization-server/api/v1/auth` | GET | OAuth2 server metadata |
| `/api/v1/auth/oauth2/authorize` | GET | OAuth2 authorization endpoint |
| `/api/v1/auth/oauth2/token` | POST | OAuth2 token endpoint |
| `/auth/login` | GET/POST | Login page with OAuth client_id support |

### Service Discovery Response

```typescript
// GET /.well-known/terraform.json
{
  "login.v1": {
    "client": "terraform-cli",
    "grant_types": ["authz_code"],
    "authz": "/api/v1/auth/oauth2/authorize",
    "token": "/api/v1/auth/oauth2/token",
    "ports": [10000, 10010]
  }
}
```

### OAuth Client Configuration

The `terraform-cli` OAuth client is auto-registered on app startup:

```typescript
{
  clientId: "terraform-cli",
  name: "terraform-cli",
  redirectUris: [
    "http://localhost:10000/login",
    "http://localhost:10001/login",
    // ... through 10010/login
  ],
  skipConsent: true,              // Trusted client
  public: true,                   // No client secret required
  tokenEndpointAuthMethod: "none",
  responseTypes: ["code"],
  grantTypes: ["authorization_code"],
  scopes: ["openid", "profile", "email", "offline_access"]
}
```

### Login Flow

1. `terraform login <hostname>` fetches `/.well-known/terraform.json`
2. CLI opens browser to `/api/v1/auth/oauth2/authorize?client_id=terraform-cli&...`
3. User redirected to `/auth/login` if not authenticated
4. After login, redirected back to authorize endpoint
5. Authorization code issued, CLI exchanges for access token
6. Token stored in `~/.terraform.d/credentials.tfrc.json`

### Database Tables (OAuth)

- `oauthClients` - Registered OAuth clients
- `oauthAccessTokens` - Issued access tokens
- `oauthRefreshTokens` - Refresh tokens with scopes
- `oauthConsents` - User consent records
- `jwkss` - JSON Web Key Sets for JWT signing

---

## Shared Types

```typescript
import { z } from "zod";
import { router, procedure } from "@orpc/server";

/* =========================
   Shared Schemas
   ========================= */

const Organization = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
});

const Workspace = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  executionMode: z.enum(["local", "remote", "agent"]),
  terraformVersion: z.string().optional(),
  autoApply: z.boolean().default(false),
  workingDirectory: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const ConfigurationVersion = z.object({
  id: z.string(),
  workspaceId: z.string(),
  status: z.enum(["pending", "uploaded", "errored"]),
  uploadUrl: z.string().optional(),
  createdAt: z.string().datetime(),
});

const Run = z.object({
  id: z.string(),
  workspaceId: z.string(),
  configVersionId: z.string(),
  status: z.enum([
    "pending",
    "fetching",
    "fetching_completed",
    "pre_plan_running",
    "pre_plan_completed",
    "queuing",
    "planning",
    "planned",
    "cost_estimating",
    "cost_estimated",
    "policy_checking",
    "policy_override",
    "policy_soft_failed",
    "policy_checked",
    "confirmed",
    "post_plan_running",
    "post_plan_completed",
    "planned_and_finished",
    "planned_and_saved",
    "applying",
    "applied",
    "discarded",
    "errored",
    "canceled",
    "force_canceled",
  ]),
  message: z.string().optional(),
  isDestroy: z.boolean().default(false),
  refreshOnly: z.boolean().default(false),
  planId: z.string().optional(),
  applyId: z.string().optional(),
  createdAt: z.string().datetime(),
});

const Plan = z.object({
  id: z.string(),
  runId: z.string(),
  status: z.enum(["pending", "managed_queued", "queued", "running", "finished", "errored", "canceled", "unreachable"]),
  hasChanges: z.boolean().default(false),
  resourceAdditions: z.number().default(0),
  resourceChanges: z.number().default(0),
  resourceDestructions: z.number().default(0),
  logReadUrl: z.string().optional(),
  executionDetails: z.object({
    mode: z.enum(["remote", "local"]),
  }).optional(),
});

const Apply = z.object({
  id: z.string(),
  runId: z.string(),
  status: z.enum(["pending", "managed_queued", "queued", "running", "finished", "errored", "canceled", "unreachable"]),
  resourceAdditions: z.number().default(0),
  resourceChanges: z.number().default(0),
  resourceDestructions: z.number().default(0),
  logReadUrl: z.string().optional(),
});

const StateVersion = z.object({
  id: z.string(),
  workspaceId: z.string(),
  serial: z.number(),
  md5: z.string(),
  lineage: z.string(),
  downloadUrl: z.string(),
  createdAt: z.string().datetime(),
});
```

---

## Organizations Router (🔲 TODO)

Handles organization and workspace management for `terraform init`.

```typescript
/* =========================
   ORGANIZATIONS ROUTER
   terraform init
   ========================= */

const orgsRouter = router({
  /**
   * List Organizations
   * REST: GET /api/v2/organizations
   */
  listOrganizations: procedure
    .output(z.object({
      organizations: z.array(Organization),
      totalCount: z.number(),
    }))
    .query(async () => { /* TODO */ }),

  /**
   * Get Organization
   * REST: GET /api/v2/organizations/:name
   */
  getOrganization: procedure
    .input(z.object({ orgName: z.string() }))
    .output(Organization)
    .query(async ({ input }) => { /* TODO */ }),

  /**
   * Get Workspace
   * REST: GET /api/v2/organizations/:org/workspaces/:name
   */
  getWorkspace: procedure
    .input(z.object({
      orgName: z.string(),
      workspaceName: z.string(),
    }))
    .output(Workspace)
    .query(async ({ input }) => { /* TODO */ }),

  /**
   * Create Workspace
   * REST: POST /api/v2/organizations/:org/workspaces
   */
  createWorkspace: procedure
    .input(z.object({
      orgName: z.string(),
      name: z.string(),
      executionMode: z.enum(["local", "remote", "agent"]).default("remote"),
    }))
    .output(Workspace)
    .mutation(async ({ input }) => { /* TODO */ }),

  /**
   * Lock/Unlock Workspace
   * REST: POST /api/v2/workspaces/:id/actions/lock
   * REST: POST /api/v2/workspaces/:id/actions/unlock
   */
});
```

---

## State Router (🔲 TODO)

Handles state storage and versioning.

```typescript
/* =========================
   STATE ROUTER
   terraform init, apply
   ========================= */

const stateRouter = router({
  /**
   * Get Current State Version
   * REST: GET /api/v2/workspaces/:id/current-state-version
   */
  getCurrentState: procedure
    .input(z.object({ workspaceId: z.string() }))
    .output(StateVersion.nullable())
    .query(async ({ input }) => { /* TODO */ }),

  /**
   * Get State Download URL
   * REST: GET /api/v2/state-versions/:id/download
   */
  getStateDownloadUrl: procedure
    .input(z.object({ stateVersionId: z.string() }))
    .output(z.object({ url: z.string() }))
    .query(async ({ input }) => { /* TODO */ }),

  /**
   * Create State Version
   * REST: POST /api/v2/workspaces/:id/state-versions
   */
  createStateVersion: procedure
    .input(z.object({
      workspaceId: z.string(),
      serial: z.number(),
      md5: z.string(),
      lineage: z.string(),
      state: z.string(),
    }))
    .output(StateVersion)
    .mutation(async ({ input }) => { /* TODO */ }),
});
```

---

## Configuration Router (🔲 TODO)

Handles configuration version uploads for plan/apply.

```typescript
/* =========================
   CONFIGURATION ROUTER
   terraform plan, apply
   ========================= */

const configRouter = router({
  /**
   * Create Configuration Version
   * REST: POST /api/v2/workspaces/:id/configuration-versions
   */
  createConfigVersion: procedure
    .input(z.object({
      workspaceId: z.string(),
      autoQueueRuns: z.boolean().default(false),
      speculative: z.boolean().default(false),
    }))
    .output(ConfigurationVersion)
    .mutation(async ({ input }) => { /* TODO */ }),

  /**
   * Get Configuration Version
   * REST: GET /api/v2/configuration-versions/:id
   */
  getConfigVersion: procedure
    .input(z.object({ configVersionId: z.string() }))
    .output(ConfigurationVersion)
    .query(async ({ input }) => { /* TODO */ }),
});
```

---

## Runs Router (🔲 TODO)

Handles the plan/apply lifecycle.

```typescript
/* =========================
   RUNS ROUTER
   terraform plan, apply
   ========================= */

const runsRouter = router({
  /**
   * Create Run
   * REST: POST /api/v2/runs
   */
  createRun: procedure
    .input(z.object({
      workspaceId: z.string(),
      configVersionId: z.string().optional(),
      message: z.string().optional(),
      isDestroy: z.boolean().default(false),
    }))
    .output(Run)
    .mutation(async ({ input }) => { /* TODO */ }),

  /**
   * Get Run
   * REST: GET /api/v2/runs/:id
   */
  getRun: procedure
    .input(z.object({ runId: z.string() }))
    .output(Run)
    .query(async ({ input }) => { /* TODO */ }),

  /**
   * Apply Run
   * REST: POST /api/v2/runs/:id/actions/apply
   */
  applyRun: procedure
    .input(z.object({ runId: z.string() }))
    .output(Run)
    .mutation(async ({ input }) => { /* TODO */ }),

  /**
   * Discard/Cancel Run
   * REST: POST /api/v2/runs/:id/actions/discard
   * REST: POST /api/v2/runs/:id/actions/cancel
   */
});
```

---

## Logs Router (🔲 TODO)

Handles streaming logs for plan/apply operations.

```typescript
/* =========================
   LOGS ROUTER
   terraform plan, apply
   ========================= */

const logsRouter = router({
  /**
   * Get Plan Logs
   * REST: GET /api/v2/plans/:id/logs
   */
  getPlanLogs: procedure
    .input(z.object({ planId: z.string() }))
    .output(z.object({ logReadUrl: z.string() }))
    .query(async ({ input }) => { /* TODO */ }),

  /**
   * Get Apply Logs
   * REST: GET /api/v2/applies/:id/logs
   */
  getApplyLogs: procedure
    .input(z.object({ applyId: z.string() }))
    .output(z.object({ logReadUrl: z.string() }))
    .query(async ({ input }) => { /* TODO */ }),
});
```

---

## CLI Command Mapping

### `terraform login` ✅

| Step | Implementation | Endpoint |
|------|----------------|----------|
| 1. Discover auth | SvelteKit route | `GET /.well-known/terraform.json` |
| 2. Authorize | better-auth oauthProvider | `GET /api/v1/auth/oauth2/authorize` |
| 3. Login | SvelteKit page | `GET/POST /auth/login` |
| 4. Token exchange | better-auth oauthProvider | `POST /api/v1/auth/oauth2/token` |

### `terraform init` 🔲

| Step | oRPC Procedure | REST Endpoint |
|------|----------------|---------------|
| 1. Get workspace | `orgs.getWorkspace` | `GET /api/v2/organizations/:org/workspaces/:name` |
| 2. Create if missing | `orgs.createWorkspace` | `POST /api/v2/organizations/:org/workspaces` |
| 3. Get current state | `state.getCurrentState` | `GET /api/v2/workspaces/:id/current-state-version` |
| 4. Download state | `state.getStateDownloadUrl` | `GET /api/v2/state-versions/:id/download` |

### `terraform plan` 🔲

| Step | oRPC Procedure | REST Endpoint |
|------|----------------|---------------|
| 1. Create config version | `config.createConfigVersion` | `POST /api/v2/workspaces/:id/configuration-versions` |
| 2. Upload tarball | _(direct to pre-signed URL)_ | `PUT <uploadUrl>` |
| 3. Create run | `runs.createRun` | `POST /api/v2/runs` |
| 4. Poll status | `runs.getRun` | `GET /api/v2/runs/:id` |
| 5. Stream logs | `logs.getPlanLogs` | `GET /api/v2/plans/:id/logs` |

### `terraform apply` 🔲

| Step | oRPC Procedure | REST Endpoint |
|------|----------------|---------------|
| 1. Confirm apply | `runs.applyRun` | `POST /api/v2/runs/:id/actions/apply` |
| 2. Poll status | `runs.getRun` | `GET /api/v2/runs/:id` |
| 3. Stream logs | `logs.getApplyLogs` | `GET /api/v2/applies/:id/logs` |
| 4. Upload state | `state.createStateVersion` | `POST /api/v2/workspaces/:id/state-versions` |

---

## Implementation Requirements

### 1. REST Compatibility Layer

Terraform CLI expects JSON:API formatted requests/responses at `/api/v2/*`:

```typescript
// Incoming JSON:API request
POST /api/v2/runs
{
  "data": {
    "type": "runs",
    "attributes": { "message": "Triggered via CLI" },
    "relationships": {
      "workspace": { "data": { "type": "workspaces", "id": "ws-xxx" } }
    }
  }
}

// Response back to JSON:API format
{
  "data": {
    "type": "runs",
    "id": "run-xxx",
    "attributes": { ... }
  }
}
```

### 2. Pre-signed URL Handling

- **Configuration upload**: Generate pre-signed URLs for tarball upload
- **State download**: Generate pre-signed URLs for state file downloads
- **Log streaming**: Support chunked transfer or Server-Sent Events

### 3. Worker System

Background worker to execute:

- Plan operations (terraform plan)
- Apply operations (terraform apply)
- State serialization and storage

---

## Design Principles

1. **OAuth2 for auth**: Use better-auth's oauthProvider for standard OAuth2 flows
2. **Flattened data model**: No JSON:API relationships internally
3. **Explicit lifecycle objects**: Run → Plan → Apply with clear status transitions
4. **URL-based streaming**: Logs via streaming URLs, not embedded in responses
5. **Pagination everywhere**: All list endpoints support pagination

---

## Security Considerations

1. **OAuth2 scopes**: Use standard scopes (openid, profile, email, offline_access)
2. **Workspace permissions**: Read, plan, apply, admin levels
3. **Sensitive variables**: Never return values, only indicate sensitivity
4. **State encryption**: Encrypt state at rest
5. **Audit logging**: Log all state changes and applies
