import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const contactsTable = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatarColor: text("avatar_color").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
  avatarUrl: text("avatar_url"),
  disappearingMessages: text("disappearing_messages"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatsTable = pgTable("chats", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contactsTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => chatsTable.id).notNull(),
  content: text("content").notNull(),
  isMine: boolean("is_mine").notNull().default(false),
  isRead: boolean("is_read").notNull().default(false),
  replyToId: integer("reply_to_id"),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Contact = typeof contactsTable.$inferSelect;
export type Chat = typeof chatsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
export type InsertContact = typeof contactsTable.$inferInsert;
export type InsertChat = typeof chatsTable.$inferInsert;
export type InsertMessage = typeof messagesTable.$inferInsert;
