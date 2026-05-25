import { createId } from "@paralleldrive/cuid2";
import { defineRelations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { organizations, relations as authRelations, members, invitations } from "./auth.db";
import type z from "zod";
import type { WorkspaceAttributesSchema } from "@open-bento/tfe";

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

export const tfeRelations = defineRelations(
  {
    members,
    invitations,
    organizations,
    entitlementSets,
    workspaces
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
      })
    }
  })
)