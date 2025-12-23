import { db } from "../db.ts";
import { calendarEvent, chatSession, chatMessage } from "./schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getCalendarEvents(
  userId: string,
  timeMin: Date,
  timeMax: Date,
) {
  return db
    .select()
    .from(calendarEvent)
    .where(
      sql`${calendarEvent.userId} = ${userId} AND ${calendarEvent.startTime} >= ${timeMin} AND ${calendarEvent.startTime} <= ${timeMax}`,
    )
    .orderBy(calendarEvent.startTime);
}

export async function getChatSessions(userId: string) {
  return db
    .select()
    .from(chatSession)
    .where(eq(chatSession.userId, userId))
    .orderBy(desc(chatSession.updatedAt));
}

export async function getChatMessages(sessionId: string) {
  return db
    .select()
    .from(chatMessage)
    .where(eq(chatMessage.sessionId, sessionId))
    .orderBy(chatMessage.createdAt);
}

export async function createChatSession(userId: string, title?: string) {
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(chatSession).values({
    id,
    userId,
    title: title || null,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function addChatMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  toolSteps?: unknown,
) {
  await db.insert(chatMessage).values({
    sessionId,
    role,
    content,
    toolSteps: toolSteps ? JSON.stringify(toolSteps) : null,
    createdAt: new Date(),
  });
}

export async function updateChatSession(sessionId: string, title: string) {
  await db
    .update(chatSession)
    .set({ title, updatedAt: new Date() })
    .where(eq(chatSession.id, sessionId));
}

