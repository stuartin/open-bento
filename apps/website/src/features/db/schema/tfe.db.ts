import { createId } from "@paralleldrive/cuid2";
import { defineRelations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { organizations, members, invitations } from "./auth.db";
import type z from "zod";
import type { RunAttributesSchema, WorkspaceAttributesSchema } from "@open-bento/tfe";

export const entitlementSets = sqliteTable(
  "entitlement_sets",
  {
    id: text().primaryKey().$defaultFn(() => createId()),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    operations: integer({ mode: "boolean" }).default(true).notNull()
  },
  (table) => [
    uniqueIndex("entitlementSets_organizationId_uidx").on(table.organizationId)
  ]
);

export const workspaces = sqliteTable(
  "workspaces",
  {
    id: text().primaryKey().$defaultFn(() => createId()),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text().notNull(),
    executionMode: text({ enum: ["remote", "local", "agent"] }).default("remote").notNull(),
    terraformVersion: text().default("latest").notNull(),
    locked: integer({ mode: "boolean" }).default(false).notNull(),
    permissions: text({ mode: "json" })
      .$type<z.infer<typeof WorkspaceAttributesSchema.shape.permissions>>()
      .default({
        "can-queue-run": true
      })
      .notNull()
  },
  (table) => [
    index("workspaces_organizationId_idx").on(table.organizationId),
    uniqueIndex("workspaces_organizationId_name_uidx").on(table.organizationId, table.name)
  ]
);

export const configurationVersions = sqliteTable(
  "configuration_versions",
  {
    id: text().primaryKey().$defaultFn(() => createId()),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    autoQueueRuns: integer({ mode: "boolean" }).default(false).notNull(),
    speculative: integer({ mode: "boolean" }).default(false).notNull(),
    provisional: integer({ mode: "boolean" }).default(false).notNull(),
    status: text({ enum: ["pending", "uploaded", "errored"] }).default("pending").notNull(),
    uploadUrl: text(),
  },
  (table) => [
    index("configurationVersions_organizationId_idx").on(table.organizationId),
    index("configurationVersions_workspaceId_idx").on(table.workspaceId),
  ]
);

export const runs = sqliteTable(
  "runs",
  {
    id: text().primaryKey().$defaultFn(() => createId()),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    configurationVersionId: text()
      .notNull()
      .references(() => configurationVersions.id, { onDelete: "cascade" }),
    status: text({
      enum: [
        "pending",
        "plan_queued",
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
        "apply_queued",
        "applying",
        "applied",
        "discarded",
        "errored",
        "canceled",
        "force_canceled",
      ]
    }).default("pending").notNull(),
    hasChanges: integer({ mode: "boolean" }).default(false).notNull(),
    autoApply: integer({ mode: "boolean" }).default(false).notNull(),
    refresh: integer({ mode: "boolean" }).default(false).notNull(),
    isDestroy: integer({ mode: "boolean" }).default(false).notNull(),
    planOnly: integer({ mode: "boolean" }).default(true).notNull(),
    message: text(),
    positionInQueue: integer().default(0).notNull(),
    actions: text({ mode: "json" })
      .$type<z.infer<typeof RunAttributesSchema.shape.actions>>()
      .default({
        "is-cancelable": true,
        "is-confirmable": false,
        "is-discardable": false,
        "is-force-cancelable": false,
      })
      .notNull(),
    permissions: text({ mode: "json" })
      .$type<z.infer<typeof RunAttributesSchema.shape.permissions>>()
      .default({
        "can-apply": true,
        "can-cancel": true,
        "can-comment": true,
        "can-discard": true,
        "can-force-execute": true,
        "can-force-cancel": true,
        "can-override-policy-check": true,
      })
      .notNull(),
    variables: text({ mode: "json" })
      .$type<z.infer<typeof RunAttributesSchema.shape.variables>>()
      .default([])
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(sql`(current_timestamp)`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(sql`(current_timestamp)`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("runs_organizationId_idx").on(table.organizationId),
    index("runs_workspaceId_idx").on(table.workspaceId),
    index("runs_configurationVersionId_idx").on(table.configurationVersionId),
  ]
);

export const plans = sqliteTable(
  "plans",
  {
    id: text().primaryKey().$defaultFn(() => createId()),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    runId: text()
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    status: text({
      enum: [
        "pending",
        "managed_queued",
        "queued",
        "agent_queued",
        "running",
        "errored",
        "canceled",
        "finished",
        "unreachable",
      ]
    }).default("pending").notNull(),
    logReadUrl: text().notNull(),
    hasChanges: integer({ mode: "boolean" }).default(false).notNull(),
    resourceAdditions: integer(),
    resourceChanges: integer(),
    resourceDestructions: integer(),
  },
  (table) => [
    index("plans_organizationId_idx").on(table.organizationId),
    index("plans_workspaceId_idx").on(table.workspaceId),
    index("plans_runId_idx").on(table.runId),
  ]
);

export const tfeRelations = defineRelations(
  {
    members,
    invitations,
    organizations,
    entitlementSets,
    workspaces,
    configurationVersions,
    runs,
    plans
  },
  (r) => ({
    organizations: {
      // defaults
      members: r.many.members({
        from: r.organizations.id,
        to: r.members.organizationId,
      }),
      invitations: r.many.invitations({
        from: r.organizations.id,
        to: r.invitations.organizationId,
      }),
      // custom
      entitlementSet: r.one.entitlementSets({
        from: r.organizations.id,
        to: r.entitlementSets.organizationId,
        optional: false
      }),
      workspaces: r.many.workspaces({
        from: r.organizations.id,
        to: r.workspaces.organizationId
      }),
      configurationVersions: r.many.configurationVersions({
        from: r.organizations.id,
        to: r.configurationVersions.organizationId
      }),
      runs: r.many.runs({
        from: r.organizations.id,
        to: r.runs.organizationId
      }),
      plans: r.many.plans({
        from: r.organizations.id,
        to: r.plans.organizationId
      })
    },
    entitlementSets: {
      organization: r.one.organizations({
        from: r.entitlementSets.organizationId,
        to: r.organizations.id
      })
    },
    workspaces: {
      organization: r.one.organizations({
        from: r.workspaces.organizationId,
        to: r.organizations.id
      }),
      configurationVersions: r.many.configurationVersions({
        from: r.workspaces.id,
        to: r.configurationVersions.id
      }),
      runs: r.many.runs({
        from: r.workspaces.id,
        to: r.runs.workspaceId
      })
    },
    configurationVersions: {
      organization: r.one.organizations({
        from: r.configurationVersions.organizationId,
        to: r.organizations.id
      }),
      workspace: r.one.workspaces({
        from: r.configurationVersions.workspaceId,
        to: r.workspaces.id
      }),
      run: r.one.runs({
        from: r.configurationVersions.id,
        to: r.runs.configurationVersionId
      })
    },
    runs: {
      organization: r.one.organizations({
        from: r.runs.organizationId,
        to: r.organizations.id,
        optional: false
      }),
      workspace: r.one.workspaces({
        from: r.runs.workspaceId,
        to: r.workspaces.id,
        optional: false
      }),
      configurationVersion: r.one.configurationVersions({
        from: r.runs.configurationVersionId,
        to: r.configurationVersions.id,
        optional: false
      }),
      plan: r.one.plans({
        from: r.runs.id,
        to: r.plans.runId,
        optional: false
      })
    },
    plans: {
      organization: r.one.organizations({
        from: r.plans.organizationId,
        to: r.organizations.id
      }),
      workspace: r.one.workspaces({
        from: r.plans.workspaceId,
        to: r.workspaces.id
      }),
      run: r.one.runs({
        from: r.plans.runId,
        to: r.runs.id
      })
    },
  })
)