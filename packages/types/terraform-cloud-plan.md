Alright — let’s tie everything together into a single oRPC contract that is:

✅ Internally clean (not JSON:API)
✅ Covers auth, init, plan, apply
✅ Mappable to Terraform-compatible REST endpoints
✅ Designed for multi-tenant + scoped tokens

This is not a 1:1 clone of the Terraform Cloud API, but it contains everything required to implement a compatibility layer for Terraform / OpenTofu.

🧭 Design overview

We’ll split into 4 domains:

auth → terraform login
orgs/ws → terraform init
runs → plan/apply lifecycle
state → state storage
🧱 Full oRPC contract
import { z } from "zod";
import { router, procedure } from "@orpc/server";

/_ =========================
Shared Types
========================= _/

const Token = z.object({
id: z.string(),
type: z.enum(["user", "org"]),
scopes: z.array(z.string()),
});

const Organization = z.object({
id: z.string(),
name: z.string(),
});

const Workspace = z.object({
id: z.string(),
orgId: z.string(),
name: z.string(),
executionMode: z.enum(["local", "remote"]),
});

const Run = z.object({
id: z.string(),
workspaceId: z.string(),
status: z.enum([
"pending",
"planning",
"planned",
"applying",
"applied",
"errored",
"canceled",
]),
message: z.string().optional(),
planId: z.string().optional(),
applyId: z.string().optional(),
});

const Plan = z.object({
id: z.string(),
runId: z.string(),
status: z.enum(["pending", "running", "finished", "errored"]),
logUrl: z.string().optional(),
});

const Apply = z.object({
id: z.string(),
runId: z.string(),
status: z.enum(["pending", "running", "finished", "errored"]),
logUrl: z.string().optional(),
});

const StateVersion = z.object({
id: z.string(),
workspaceId: z.string(),
version: z.number(),
downloadUrl: z.string,
});

/_ =========================
AUTH (terraform login)
========================= _/

const authRouter = router({
/\*\*

- Service discovery
- → GET /.well-known/terraform.json
  \*/
  serviceDiscovery: procedure
  .output(
  z.object({
  "login.v1": z.object({
  client: z.literal("terraform-cli"),
  grant_types: z.array(z.string()),
  }),
  })
  )
  .query(async () => ({
  "login.v1": {
  client: "terraform-cli",
  grant_types: ["token"],
  },
  })),

/\*\*

- Validate token
- → GET /account/details
  \*/
  getAccountDetails: procedure
  .input(z.object({ token: z.string() }))
  .output(
  z.object({
  userId: z.string(),
  username: z.string(),
  })
  )
  .query(async ({ input }) => {
  // validate token + return identity
  }),
  });

/_ =========================
ORGS + WORKSPACES (init)
========================= _/

const orgRouter = router({
/\*\*

- Get workspace
- → GET /organizations/:org/workspaces/:name
  \*/
  getWorkspace: procedure
  .input(
  z.object({
  orgName: z.string(),
  workspaceName: z.string(),
  })
  )
  .output(Workspace)
  .query(async ({ input }) => {
  // resolve org + workspace
  }),

/\*\*

- Create workspace (if missing)
- → POST /organizations/:org/workspaces
  \*/
  createWorkspace: procedure
  .input(
  z.object({
  orgName: z.string(),
  workspaceName: z.string(),
  executionMode: z.enum(["local", "remote"]).default("remote"),
  })
  )
  .output(Workspace)
  .mutation(async ({ input }) => {
  // create workspace
  }),
  });

/_ =========================
STATE (init + apply)
========================= _/

const stateRouter = router({
/\*\*

- Get current state metadata
- → GET /workspaces/:id/current-state-version
  \*/
  getCurrentState: procedure
  .input(z.object({ workspaceId: z.string() }))
  .output(StateVersion.nullable())
  .query(async ({ input }) => {
  // return latest state or null
  }),

/\*\*

- Download state (signed URL)
- → GET /state-versions/:id/download
  \*/
  getStateDownloadUrl: procedure
  .input(z.object({ stateVersionId: z.string() }))
  .output(z.object({ url: z.string() }))
  .query(async ({ input }) => {
  // return pre-signed download URL
  }),

/\*\*

- Upload new state (after apply)
- → POST /state-versions
  \*/
  createStateVersion: procedure
  .input(
  z.object({
  workspaceId: z.string(),
  runId: z.string(),
  uploadUrl: z.string(),
  })
  )
  .output(StateVersion)
  .mutation(async ({ input }) => {
  // register new state
  }),
  });

/_ =========================
CONFIG UPLOAD (plan/apply)
========================= _/

const configRouter = router({
/\*\*

- Create config version
- → POST /workspaces/:id/configuration-versions
  \*/
  createConfigVersion: procedure
  .input(
  z.object({
  workspaceId: z.string(),
  autoQueueRuns: z.boolean().default(false),
  })
  )
  .output(
  z.object({
  configVersionId: z.string(),
  uploadUrl: z.string(),
  })
  )
  .mutation(async ({ input }) => {
  // generate pre-signed upload URL
  }),
  });

/_ =========================
RUNS (plan/apply lifecycle)
========================= _/

const runRouter = router({
/\*\*

- Create run
- → POST /runs
  \*/
  createRun: procedure
  .input(
  z.object({
  workspaceId: z.string(),
  configVersionId: z.string(),
  message: z.string().optional(),
  })
  )
  .output(Run)
  .mutation(async ({ input }) => {
  // enqueue run
  }),

/\*\*

- Get run (polling)
- → GET /runs/:id
  \*/
  getRun: procedure
  .input(z.object({ runId: z.string() }))
  .output(Run)
  .query(async ({ input }) => {
  // return run status
  }),

/\*\*

- Apply run
- → POST /runs/:id/actions/apply
  \*/
  applyRun: procedure
  .input(z.object({ runId: z.string() }))
  .output(Apply)
  .mutation(async ({ input }) => {
  // trigger apply
  }),
  });

/_ =========================
PLAN + APPLY LOGS
========================= _/

const logRouter = router({
/\*\*

- Get plan logs
- → GET /plans/:id/logs
  \*/
  getPlanLogs: procedure
  .input(z.object({ planId: z.string() }))
  .output(z.object({ streamUrl: z.string() }))
  .query(async ({ input }) => {
  // return streaming URL
  }),

/\*\*

- Get apply logs
- → GET /applies/:id/logs
  \*/
  getApplyLogs: procedure
  .input(z.object({ applyId: z.string() }))
  .output(z.object({ streamUrl: z.string() }))
  .query(async ({ input }) => {
  // return streaming URL
  }),
  });

/_ =========================
ROOT ROUTER
========================= _/

export const terraformCompatRouter = router({
auth: authRouter,
orgs: orgRouter,
state: stateRouter,
config: configRouter,
runs: runRouter,
logs: logRouter,
});
🔁 How this maps to Terraform CLI
terraform login
auth.serviceDiscovery
auth.getAccountDetails
terraform init
orgs.getWorkspace
orgs.createWorkspace (optional)
state.getCurrentState
state.getStateDownloadUrl
terraform plan
config.createConfigVersion
(upload tarball via returned URL)
runs.createRun
runs.getRun (polling)
logs.getPlanLogs
terraform apply
runs.applyRun
logs.getApplyLogs
state.createStateVersion
🧱 What you still need (outside oRPC)

This contract assumes you also implement:

1. REST compatibility layer

Translate:

/api/v2/runs → runs.createRun 2. Pre-signed URL handling
Upload (config tarball)
Download (state) 3. Worker system

Actually executes:

plan
apply 4. Log streaming
HTTP streaming or WebSocket
🧠 Key design choices (important)

1. Flattened data model

No JSON:API relationships — much easier to maintain.

2. Explicit lifecycle objects

Run → Plan → Apply

3. URL-based streaming

Instead of embedding logs in responses.

4. Token-agnostic contract

Auth handled outside procedures via middleware.

⚠️ Final reality check

This contract is:

✅ Enough to fully support:

terraform login
terraform init
terraform plan
terraform apply

❗ But only if you also:

mimic API shapes expected by go-tfe
implement polling + streaming correctly
