import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const server = pgTable(
  "server",
  (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    name: t.text("name").notNull(),
    description: t.text("description"),
    icon: t.text("icon"),
    ownerId: t
      .text("owner_id")
      .notNull()
      .references(() => user.id),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
    updatedAt: t
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (table) => [index("server_by_owner").on(table.ownerId)]
);

export const invite = pgTable(
  "invite",
  (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    code: t.text("code").notNull().unique(),
    uses: t.integer("uses").notNull().default(0),
    maxUses: t.integer("max_uses"),
    expiresAt: t.timestamp("expires_at"),
    serverId: t
      .uuid("server_id")
      .notNull()
      .references(() => server.id, { onDelete: "cascade" }),
    createdBy: t
      .text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
  }),
  (table) => [
    index("invite_by_code").on(table.code),
    uniqueIndex("invite_by_server_and_code").on(table.serverId, table.code),
  ]
);

export const channelType = pgEnum("channel_type", ["text", "voice"]);

export const channel = pgTable(
  "channel",
  (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    name: t.text("name").notNull(),
    type: channelType().notNull(),
    serverId: t
      .uuid("server_id")
      .notNull()
      .references(() => server.id, { onDelete: "cascade" }),
    position: t.integer("position").notNull().default(0),
    topic: t.text("topic"),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
    updatedAt: t
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (table) => [
    index("channel_by_server_and_position").on(table.serverId, table.position),
  ]
);

export const message = pgTable(
  "message",
  (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    content: t.text("content").notNull(),
    channelId: t
      .uuid("channel_id")
      .notNull()
      .references(() => channel.id, { onDelete: "cascade" }),
    authorId: t
      .text("author_id")
      .notNull()
      .references(() => user.id),
    editedAt: t.timestamp("edited_at"),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
    updatedAt: t
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (table) => [
    index("message_by_channel_and_date").on(table.channelId, table.createdAt),
  ]
);

export const member = pgTable(
  "member",
  (t) => ({
    id: t.uuid("id").notNull().primaryKey().defaultRandom(),
    serverId: t
      .uuid("server_id")
      .notNull()
      .references(() => server.id, { onDelete: "cascade" }),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    nickname: t.text("nickname"),
    joinedAt: t.timestamp("joined_at").defaultNow().notNull(),
    updatedAt: t
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (table) => [
    index("member_by_user").on(table.userId),
    uniqueIndex("member_by_server_and_user").on(table.serverId, table.userId),
  ]
);

export const serverRelations = relations(server, ({ one, many }) => ({
  channels: many(channel),
  members: many(member),
  invites: many(invite),
  owner: one(user, {
    fields: [server.ownerId],
    references: [user.id],
  }),
}));

export const inviteRelations = relations(invite, ({ one }) => ({
  server: one(server, {
    fields: [invite.serverId],
    references: [server.id],
  }),
  createdByUser: one(user, {
    fields: [invite.createdBy],
    references: [user.id],
  }),
}));

export const channelRelations = relations(channel, ({ one, many }) => ({
  server: one(server, {
    fields: [channel.serverId],
    references: [server.id],
  }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  channel: one(channel, {
    fields: [message.channelId],
    references: [channel.id],
  }),
  author: one(user, {
    fields: [message.authorId],
    references: [user.id],
  }),
}));

export const memberRelations = relations(member, ({ one }) => ({
  server: one(server, {
    fields: [member.serverId],
    references: [server.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export * from "./auth";
