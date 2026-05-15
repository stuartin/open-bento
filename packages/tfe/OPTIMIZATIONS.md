# TFE Package Optimizations

Based on a review of the [jsonapi-serde documentation](https://jsonapi-serde.js.org/) and current implementation patterns, this document outlines opportunities for optimization and better alignment with the library's intended design patterns.

## Current Architecture Issues

### 1. Duplicate Serializers Per Operation ❌

**Current Pattern:**

```typescript
// workspace.schema.ts
export const serializeGetWorkspaceOutput: EntitySerializer<Workspace> = {
  /* ... */
};
export const serializeListWorkspacesOutput: EntitySerializer<Workspace> = {
  /* ... */
};
```

**Problem:**

- Creates nearly identical serializers for each operation (get, list, create, update)
- Violates the library's design principle of one serializer per resource type
- Increases bundle size and maintenance burden

**Library's Intended Pattern:**

```typescript
// ✅ Single serializer per entity type
export const serializeWorkspace: EntitySerializer<Workspace> = {
  getId: (workspace) => workspace.id,
  serialize: (workspace) => ({
    attributes: {
      name: workspace.name,
      "execution-mode": workspace["execution-mode"],
      "terraform-version": workspace["terraform-version"],
      locked: workspace.locked,
    },
    relationships: {
      organization: workspace.organizationId
        ? {
            data: { type: "organizations", id: workspace.organizationId },
          }
        : undefined,
      "current-state-version": workspace.currentStateVersionId
        ? {
            data: {
              type: "state-versions",
              id: workspace.currentStateVersionId,
            },
          }
        : undefined,
    },
  }),
};
```

**Benefits:**

- Single source of truth for serialization logic
- The library automatically handles wrapping in `data: {...}` vs `data: [...]`
- Reduced code duplication

---

### 2. Redundant Output Schemas ⚠️

**Current Pattern:**

```typescript
export const GetWorkspaceOutput = z.object({
  data: z.object({
    type: z.literal("workspaces"),
    id: z.string(),
    attributes: WorkspaceAttributesSchema,
  }),
});

export const ListWorkspacesOutput = z.object({
  data: z.array(
    z.object({
      type: z.literal("workspaces"),
      id: z.string(),
      attributes: WorkspaceAttributesSchema,
    }),
  ),
});
```

**Problem:**

- These schemas duplicate the structure already defined by the serializer
- They're only used for contract output validation
- The serializer's TypeScript types already provide type safety

**Recommendation:**

**Option A - Keep for Contract Validation (Current Approach)**

```typescript
// Keep if you need explicit contract output validation
export const GetWorkspaceOutput = z.object({
  data: z.object({
    type: z.literal("workspaces"),
    id: z.string(),
    attributes: WorkspaceAttributesSchema,
  }),
});
```

**Option B - Use Serializer Types (More DRY)**

```typescript
// Let the serializer define the structure
// Use SerializeMap type for type safety in contracts
export type SerializeMap = {
  workspaces: typeof serializeWorkspace;
  runs: typeof serializeRun;
  // ...
};

// In contracts, rely on serializer types instead of separate schemas
```

**Decision Point:** If contracts require explicit Zod validation of outputs, keep the output schemas. Otherwise, rely on serializer types.

---

### 3. SerializeBuilder Registration Issues ❌

**Current Pattern:**

```typescript
// index.ts
export const serialize = SerializeBuilder.new()
  .add("workspaces", serializeWorkspace)
  .add("entitlement-sets", serializeGetOrganizationEntitlementsOutput) // ❌ Operation-specific
  .add("cost-estimates", serializeCostEstimate);
// ...
```

**Problem:**

- Mixing entity-level serializers with operation-specific serializers
- `serializeGetOrganizationEntitlementsOutput` should be `serializeEntitlementSet`
- Inconsistent naming convention

**Correct Pattern:**

```typescript
// ✅ All registrations should be entity-level
export const serialize = SerializeBuilder.new()
  .add("workspaces", serializeWorkspace)
  .add("configuration-versions", serializeConfigurationVersion)
  .add("runs", serializeRun)
  .add("plans", serializePlan)
  .add("applies", serializeApply)
  .add("task-stages", serializeTaskStage)
  .add("state-versions", serializeStateVersion)
  .add("state-version-outputs", serializeStateVersionOutput)
  .add("entitlement-sets", serializeEntitlementSet) // ✅ Entity-level
  .add("cost-estimates", serializeCostEstimate)
  .add("task-results", serializeTaskResult)
  .add("policy-evaluations", serializePolicyEvaluation)
  .build();
```

---

### 4. Deserializer Cardinality Duplication ℹ️

**Current Pattern:**

```typescript
export const deserializeGetWorkspaceOutput = createDeserializer({
  type: "workspaces",
  cardinality: "one",
  attributesSchema: WorkspaceAttributesSchema,
  relationships: {
    /* ... */
  },
});

export const deserializeListWorkspacesOutput = createDeserializer({
  type: "workspaces",
  cardinality: "many",
  attributesSchema: WorkspaceAttributesSchema,
  // Note: no relationships defined for list
});
```

**Problem:**

- Two deserializers for the same entity type
- Only difference is cardinality
- List deserializer loses relationship configuration

**Recommendation:**

**Option A - Single Deserializer (Simplest)**

```typescript
// ✅ One deserializer, specify cardinality at call site
export const deserializeWorkspace = createDeserializer({
  type: "workspaces",
  cardinality: "one", // default
  attributesSchema: WorkspaceAttributesSchema,
  relationships: {
    organization: {
      type: "organizations",
      cardinality: "one",
      included: OrganizationAttributesSchema,
    },
    "current-state-version": {
      type: "state-versions",
      cardinality: "one",
      included: StateVersionAttributesSchema,
    },
  },
});

// Can be used for both single and collection responses
// The library handles the difference automatically
```

**Option B - Separate Deserializers with Shared Config**

```typescript
// If you need different relationship configs for get vs list
const workspaceDeserializerConfig = {
  type: "workspaces" as const,
  attributesSchema: WorkspaceAttributesSchema,
  relationships: {
    /* ... */
  },
};

export const deserializeWorkspace = createDeserializer({
  ...workspaceDeserializerConfig,
  cardinality: "one",
});

export const deserializeWorkspaces = createDeserializer({
  ...workspaceDeserializerConfig,
  cardinality: "many",
});
```

---

### 5. Missing Relationship Expansion Configuration ⚠️

**Current Pattern:**

```typescript
relationships: {
  organization: {
    type: "organizations",
    cardinality: "one",
    // ❌ Missing 'included' configuration
  },
  "current-state-version": {
    type: "state-versions",
    cardinality: "one",
    // ❌ Missing 'included' configuration
  }
}
```

**Problem:**

- Without `included`, relationships only contain resource identifiers
- Cannot access related object properties (e.g., `workspace.organization.name`)
- Misses key feature of the library

**Correct Pattern:**

```typescript
relationships: {
  organization: {
    type: "organizations",
    cardinality: "one",
    included: OrganizationAttributesSchema, // ✅ Enables expansion
  },
  "current-state-version": {
    type: "state-versions",
    cardinality: "one",
    included: StateVersionAttributesSchema, // ✅ Enables expansion
  }
}
```

**Benefits:**

- Access nested properties: `workspace.organization.name`
- Automatic validation of included resources
- Recursive relationship support

---

## Recommended File Structure Pattern

### Schema File (`entity.schema.ts`)

```typescript
import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION (One per resource type)
// ============================================================

export const WorkspaceAttributesSchema = z.object({
  name: z.string(),
  "execution-mode": z.enum(["remote", "local", "agent"]),
  "terraform-version": z.string().nullable(),
  locked: z.boolean().optional(),
});

export type Workspace = z.infer<typeof WorkspaceAttributesSchema> & {
  id: string;
  // Relationships as optional properties (populated when expanded)
  organizationId?: string;
  currentStateVersionId?: string;
};

// ONE serializer per entity
export const serializeWorkspace: EntitySerializer<Workspace> = {
  getId: (workspace) => workspace.id,
  serialize: (workspace) => ({
    attributes: {
      name: workspace.name,
      "execution-mode": workspace["execution-mode"],
      "terraform-version": workspace["terraform-version"],
      locked: workspace.locked,
    },
    relationships: {
      organization: workspace.organizationId
        ? {
            data: { type: "organizations", id: workspace.organizationId },
          }
        : undefined,
      "current-state-version": workspace.currentStateVersionId
        ? {
            data: {
              type: "state-versions",
              id: workspace.currentStateVersionId,
            },
          }
        : undefined,
    },
  }),
};

// ONE deserializer per entity (can be used with different cardinalities)
export const deserializeWorkspace = createDeserializer({
  type: "workspaces",
  cardinality: "one", // default
  attributesSchema: WorkspaceAttributesSchema,
  relationships: {
    organization: {
      type: "organizations",
      cardinality: "one",
      included: OrganizationAttributesSchema, // Import from organization.schema.ts
    },
    "current-state-version": {
      type: "state-versions",
      cardinality: "one",
      included: StateVersionAttributesSchema, // Import from state-version.schema.ts
    },
  },
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS (For contract validation)
// ============================================================

// --- Get Workspace ---

export const GetWorkspaceInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
    workspace: z.string().describe("Workspace name"),
  }),
  headers: AuthHeadersSchema,
});

export const GetWorkspaceOutput = z.object({
  data: z.object({
    type: z.literal("workspaces"),
    id: z.string(),
    attributes: WorkspaceAttributesSchema,
  }),
});

// --- List Workspaces ---

export const ListWorkspacesInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
  }),
  query: z
    .object({
      "page[number]": z.number().int().min(1).optional(),
      "page[size]": z.number().int().min(1).max(100).optional(),
      search: z.string().optional(),
    })
    .optional(),
  headers: AuthHeadersSchema,
});

export const ListWorkspacesOutput = z.object({
  data: z.array(
    z.object({
      type: z.literal("workspaces"),
      id: z.string(),
      attributes: WorkspaceAttributesSchema,
    }),
  ),
});

// --- Create Workspace ---

export const CreateWorkspaceInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
  }),
  body: z.object({
    data: z.object({
      type: z.literal("workspaces"),
      attributes: WorkspaceAttributesSchema.pick({
        name: true,
        "execution-mode": true,
        "terraform-version": true,
      }),
    }),
  }),
  headers: AuthHeadersSchema,
});

export const CreateWorkspaceOutput = GetWorkspaceOutput; // Reuse

// --- Update Workspace ---

export const UpdateWorkspaceInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
    workspace: z.string().describe("Workspace name"),
  }),
  body: z.object({
    data: z.object({
      type: z.literal("workspaces"),
      attributes: WorkspaceAttributesSchema.partial(),
    }),
  }),
  headers: AuthHeadersSchema,
});

export const UpdateWorkspaceOutput = GetWorkspaceOutput; // Reuse
```

### Contract File (`entity.contract.ts`)

```typescript
import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  GetWorkspaceInput,
  GetWorkspaceOutput,
  ListWorkspacesInput,
  ListWorkspacesOutput,
  CreateWorkspaceInput,
  CreateWorkspaceOutput,
  UpdateWorkspaceInput,
  UpdateWorkspaceOutput,
} from "./workspace.schema";

export const getWorkspace = oc
  .route({
    path: "/api/v2/organizations/{organization}/workspaces/{workspace}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetWorkspaceInput)
  .output(
    z.object({
      status: z.literal(200),
      body: GetWorkspaceOutput,
    }),
  );

export const listWorkspaces = oc
  .route({
    path: "/api/v2/organizations/{organization}/workspaces",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListWorkspacesInput)
  .output(
    z.object({
      status: z.literal(200),
      body: ListWorkspacesOutput,
    }),
  );

export const createWorkspace = oc
  .route({
    path: "/api/v2/organizations/{organization}/workspaces",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CreateWorkspaceInput)
  .output(
    z.object({
      status: z.literal(201),
      body: CreateWorkspaceOutput,
    }),
  );

export const updateWorkspace = oc
  .route({
    path: "/api/v2/organizations/{organization}/workspaces/{workspace}",
    method: "PATCH",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(UpdateWorkspaceInput)
  .output(
    z.object({
      status: z.literal(200),
      body: UpdateWorkspaceOutput,
    }),
  );

export const workspaceContract = {
  get: getWorkspace,
  list: listWorkspaces,
  create: createWorkspace,
  update: updateWorkspace,
};
```

### Index File (`index.ts`)

```typescript
// Unified Serializer
import { SerializeBuilder } from "@jsonapi-serde/server/response";
import { serializeWorkspace } from "./features/workspace/workspace.schema";
import { serializeConfigurationVersion } from "./features/configuration-version/configuration-version.schema";
import { serializeRun } from "./features/run/run.schema";
// ... all other entity serializers

export const serialize = SerializeBuilder.new()
  .add("workspaces", serializeWorkspace)
  .add("configuration-versions", serializeConfigurationVersion)
  .add("runs", serializeRun)
  .add("plans", serializePlan)
  .add("applies", serializeApply)
  .add("task-stages", serializeTaskStage)
  .add("state-versions", serializeStateVersion)
  .add("state-version-outputs", serializeStateVersionOutput)
  .add("entitlement-sets", serializeEntitlementSet) // ✅ Not operation-specific
  .add("cost-estimates", serializeCostEstimate)
  .add("task-results", serializeTaskResult)
  .add("policy-evaluations", serializePolicyEvaluation)
  .build();
```

---

## Implementation Impact

### Breaking Changes

- Renaming serializers from operation-specific to entity-specific
- Potentially removing duplicate output schemas (if not needed for contracts)
- Updating SerializeBuilder registrations

### Non-Breaking Optimizations

- Adding `included` to relationship configurations
- Creating shared deserializer configs
- Adding type exports for better type safety

---

## Benefits Summary

1. **Reduced Code Duplication**: ~50% less serializer/deserializer code
2. **Better Type Safety**: Export and use `SerializeMap` for compile-time validation
3. **Improved DX**: Relationship expansion enables cleaner data access
4. **Smaller Bundle**: Single serializer per entity vs multiple per operation
5. **Spec Compliance**: Aligns with jsonapi-serde's intended architecture
6. **Maintainability**: Single source of truth for each entity's serialization

---

## References

- [JSON:API Serde Documentation](https://jsonapi-serde.js.org/)
- [Server Serialization Guide](https://github.com/DASPRiD/jsonapi-serde-js/blob/main/packages/docs/src/server/serialization.md)
- [Client Quickstart](https://github.com/DASPRiD/jsonapi-serde-js/blob/main/packages/docs/src/client/quickstart.md)
- [Handling Relationships](https://github.com/DASPRiD/jsonapi-serde-js/blob/main/packages/docs/src/client/handling-relationships.md)
