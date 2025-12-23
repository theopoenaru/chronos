import { pgTable, text, timestamp, jsonb, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Better Auth will auto-generate: user, session, account tables
// We reference them here for foreign keys

// Calendar event cache
export const calendarEvent = pgTable("calendar_event", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  googleEventId: text("google_event_id").notNull(),
  title: text("title").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  timezone: text("timezone"),
  allDay: boolean("all_day").default(false),
  fetchedAt: timestamp("fetched_at").defaultNow(),
});

// Chat sessions
export const chatSession = pgTable("chat_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages
export const chatMessage = pgTable("chat_message", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => chatSession.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  toolSteps: jsonb("tool_steps"), // ToolStep[]
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const chatSessionRelations = relations(chatSession, ({ many }) => ({
  messages: many(chatMessage),
}));

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
  session: one(chatSession, {
    fields: [chatMessage.sessionId],
    references: [chatSession.id],
  }),
}));

