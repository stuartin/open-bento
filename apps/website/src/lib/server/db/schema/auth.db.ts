import { defineRelations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)],
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const organizations = sqliteTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    metadata: text("metadata"),
  },
  (table) => [uniqueIndex("organizations_slug_uidx").on(table.slug)],
);

export const members = sqliteTable(
  "members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("members_organizationId_idx").on(table.organizationId),
    index("members_userId_idx").on(table.userId),
  ],
);

export const invitations = sqliteTable(
  "invitations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitations_organizationId_idx").on(table.organizationId),
    index("invitations_email_idx").on(table.email),
  ],
);

export const jwkss = sqliteTable("jwkss", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
});

export const oauthClients = sqliteTable("oauth_clients", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret"),
  disabled: integer("disabled", { mode: "boolean" }).default(false),
  skipConsent: integer("skip_consent", { mode: "boolean" }),
  enableEndSession: integer("enable_end_session", { mode: "boolean" }),
  subjectType: text("subject_type"),
  scopes: text("scopes", { mode: "json" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  name: text("name"),
  uri: text("uri"),
  icon: text("icon"),
  contacts: text("contacts", { mode: "json" }),
  tos: text("tos"),
  policy: text("policy"),
  softwareId: text("software_id"),
  softwareVersion: text("software_version"),
  softwareStatement: text("software_statement"),
  redirectUris: text("redirect_uris", { mode: "json" }).notNull(),
  postLogoutRedirectUris: text("post_logout_redirect_uris", { mode: "json" }),
  tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
  grantTypes: text("grant_types", { mode: "json" }),
  responseTypes: text("response_types", { mode: "json" }),
  public: integer("public", { mode: "boolean" }),
  type: text("type"),
  requirePKCE: integer("require_pkce", { mode: "boolean" }),
  referenceId: text("reference_id"),
  metadata: text("metadata", { mode: "json" }),
});

export const oauthRefreshTokens = sqliteTable("oauth_refresh_tokens", {
  id: text("id").primaryKey(),
  token: text("token").notNull(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClients.clientId, { onDelete: "cascade" }),
  sessionId: text("session_id").references(() => sessions.id, {
    onDelete: "set null",
  }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  referenceId: text("reference_id"),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  revoked: integer("revoked", { mode: "timestamp_ms" }),
  authTime: integer("auth_time", { mode: "timestamp_ms" }),
  scopes: text("scopes", { mode: "json" }).notNull(),
});

export const oauthAccessTokens = sqliteTable("oauth_access_tokens", {
  id: text("id").primaryKey(),
  token: text("token").unique(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClients.clientId, { onDelete: "cascade" }),
  sessionId: text("session_id").references(() => sessions.id, {
    onDelete: "set null",
  }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  referenceId: text("reference_id"),
  refreshId: text("refresh_id").references(() => oauthRefreshTokens.id, {
    onDelete: "cascade",
  }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  scopes: text("scopes", { mode: "json" }).notNull(),
});

export const oauthConsents = sqliteTable("oauth_consents", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClients.clientId, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  referenceId: text("reference_id"),
  scopes: text("scopes", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export const relations = defineRelations(
  {
    users,
    sessions,
    accounts,
    verifications,
    organizations,
    members,
    invitations,
    jwkss,
    oauthClients,
    oauthRefreshTokens,
    oauthAccessTokens,
    oauthConsents,
  },
  (r) => ({
    users: {
      sessions: r.many.sessions({
        from: r.users.id,
        to: r.sessions.userId,
      }),
      accounts: r.many.accounts({
        from: r.users.id,
        to: r.accounts.userId,
      }),
      members: r.many.members({
        from: r.users.id,
        to: r.members.userId,
      }),
      invitations: r.many.invitations({
        from: r.users.id,
        to: r.invitations.inviterId,
      }),
      oauthClients: r.many.oauthClients({
        from: r.users.id,
        to: r.oauthClients.userId,
      }),
      oauthRefreshTokens: r.many.oauthRefreshTokens({
        from: r.users.id,
        to: r.oauthRefreshTokens.userId,
      }),
      oauthAccessTokens: r.many.oauthAccessTokens({
        from: r.users.id,
        to: r.oauthAccessTokens.userId,
      }),
      oauthConsents: r.many.oauthConsents({
        from: r.users.id,
        to: r.oauthConsents.userId,
      }),
    },
    sessions: {
      users: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
      }),
      oauthRefreshTokens: r.many.oauthRefreshTokens({
        from: r.sessions.id,
        to: r.oauthRefreshTokens.sessionId,
      }),
      oauthAccessTokens: r.many.oauthAccessTokens({
        from: r.sessions.id,
        to: r.oauthAccessTokens.sessionId,
      }),
    },
    accounts: {
      users: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
      }),
    },
    organizations: {
      members: r.many.members({
        from: r.organizations.id,
        to: r.members.organizationId,
      }),
      invitations: r.many.invitations({
        from: r.organizations.id,
        to: r.invitations.organizationId,
      }),
    },
    members: {
      organizations: r.one.organizations({
        from: r.members.organizationId,
        to: r.organizations.id,
      }),
      users: r.one.users({
        from: r.members.userId,
        to: r.users.id,
      }),
    },
    invitations: {
      organizations: r.one.organizations({
        from: r.invitations.organizationId,
        to: r.organizations.id,
      }),
      users: r.one.users({
        from: r.invitations.inviterId,
        to: r.users.id,
      }),
    },
    oauthClients: {
      users: r.one.users({
        from: r.oauthClients.userId,
        to: r.users.id,
      }),
      oauthRefreshTokens: r.many.oauthRefreshTokens({
        from: r.oauthClients.id,
        to: r.oauthRefreshTokens.clientId,
      }),
      oauthAccessTokens: r.many.oauthAccessTokens({
        from: r.oauthClients.id,
        to: r.oauthAccessTokens.clientId,
      }),
      oauthConsents: r.many.oauthConsents({
        from: r.oauthClients.id,
        to: r.oauthConsents.clientId,
      }),
    },
    oauthRefreshTokens: {
      oauthClients: r.one.oauthClients({
        from: r.oauthRefreshTokens.clientId,
        to: r.oauthClients.clientId,
      }),
      sessions: r.one.sessions({
        from: r.oauthRefreshTokens.sessionId,
        to: r.sessions.id,
      }),
      users: r.one.users({
        from: r.oauthRefreshTokens.userId,
        to: r.users.id,
      }),
      oauthAccessTokens: r.many.oauthAccessTokens({
        from: r.oauthRefreshTokens.id,
        to: r.oauthAccessTokens.refreshId,
      }),
    },
    oauthAccessTokens: {
      oauthClients: r.one.oauthClients({
        from: r.oauthAccessTokens.clientId,
        to: r.oauthClients.clientId,
      }),
      sessions: r.one.sessions({
        from: r.oauthAccessTokens.sessionId,
        to: r.sessions.id,
      }),
      users: r.one.users({
        from: r.oauthAccessTokens.userId,
        to: r.users.id,
      }),
      oauthRefreshTokens: r.one.oauthRefreshTokens({
        from: r.oauthAccessTokens.refreshId,
        to: r.oauthRefreshTokens.id,
      }),
    },
    oauthConsents: {
      oauthClients: r.one.oauthClients({
        from: r.oauthConsents.clientId,
        to: r.oauthClients.clientId,
      }),
      users: r.one.users({
        from: r.oauthConsents.userId,
        to: r.users.id,
      }),
    },
  }),
);
