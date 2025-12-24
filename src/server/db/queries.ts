import { db } from "../db.ts";
import { chatSession, chatMessage } from "./schema";
import { eq, desc } from "drizzle-orm";

export async function getChatSessions(userId: string) {
  return db
    .select()
    .from(chatSession)
    .where(eq(chatSession.userId, userId))
    .orderBy(desc(chatSession.updatedAt));
}

export async function getChatMessages(sessionId: string) {
  const messages = await db
    .select()
    .from(chatMessage)
    .where(eq(chatMessage.sessionId, sessionId))
    .orderBy(chatMessage.createdAt);
  
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    parts: typeof msg.parts === "string" ? JSON.parse(msg.parts) : msg.parts,
    createdAt: msg.createdAt,
  }));
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
  id: string,
  sessionId: string,
  role: "user" | "assistant",
  parts: unknown[],
) {
  await db.insert(chatMessage).values({
    id,
    sessionId,
    role,
    parts: JSON.stringify(parts),
    createdAt: new Date(),
  });
  
  await db
    .update(chatSession)
    .set({ updatedAt: new Date() })
    .where(eq(chatSession.id, sessionId));
}

export async function updateChatSession(sessionId: string, title: string) {
  await db
    .update(chatSession)
    .set({ title, updatedAt: new Date() })
    .where(eq(chatSession.id, sessionId));
}

