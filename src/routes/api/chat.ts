import { chat, toServerSentEventsStream } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";
import { requireSession } from "@/server/auth/session";
import { SYSTEM_PROMPT } from "@/server/llm/systemPrompt";
import { createServerTools } from "@/server/tools";
import { addChatMessage, updateChatSession } from "@/server/db/queries";
import { db } from "@/server/db";
import { chatSession } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await requireSession(request);
        const userId = session.user.id;

        if (!process.env.GEMINI_API_KEY) {
          return new Response(
            JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const url = new URL(request.url);
        const sessionId = url.searchParams.get("sessionId");

        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: "sessionId required" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const body = await request.json();
        const { messages, conversationId, selectedDate, timezone, data } = body as {
          messages: any[];
          conversationId?: string;
          selectedDate?: string;
          timezone?: string;
          data?: { conversationId?: string };
        };
        const finalConversationId = conversationId || data?.conversationId || undefined;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === "user") {
          const parts = lastMessage.parts || [];
          const textPart = parts.find((p: any) => p.type === "text");
          const textContent = textPart?.content || lastMessage.content || "";
          const messageParts = parts.length > 0 ? parts : [{ type: "text", content: textContent }];
          
          const messageId = lastMessage.id || crypto.randomUUID();
          
          const existingSession = await db.select().from(chatSession).where(eq(chatSession.id, sessionId)).limit(1);
          if (existingSession.length === 0) {
            await db.insert(chatSession).values({
              id: sessionId,
              userId,
              title: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          
          await addChatMessage(messageId, sessionId, "user", messageParts);

          if (messages.length === 1 && textContent) {
            const title = textContent.trim().slice(0, 100);
            if (title) await updateChatSession(sessionId, title);
          }
        }

        const tools = createServerTools(userId);

        const allowedModels = [
          "gemini-3-pro-preview",
          "gemini-2.5-pro",
          "gemini-2.5-flash",
          "gemini-2.5-flash-preview-09-2025",
          "gemini-2.5-flash-lite",
          "gemini-2.5-flash-lite-preview-09-2025",
          "gemini-2.0-flash",
          "gemini-2.0-flash-lite",
        ] as const;
        type AllowedModel = (typeof allowedModels)[number];

        const envModel = process.env.GEMINI_MODEL;
        const model: AllowedModel =
          envModel && (allowedModels as readonly string[]).includes(envModel)
            ? (envModel as AllowedModel)
            : "gemini-2.5-flash";
        const userName = session.user.name || "User";
        
        let today: string;
        if (timezone) {
          const now = new Date();
          const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
          today = formatter.format(now);
        } else {
          today = new Date().toISOString().split('T')[0];
        }
        
        const contextParts = [
          `Today: ${today}`,
          selectedDate ? `Selected Date: ${selectedDate}` : null,
          timezone ? `Timezone: ${timezone}` : null,
          `User: ${userName}`,
        ].filter(Boolean);
        
        const calendarContextPrompt = contextParts.length > 0
          ? `CONTEXT\n${contextParts.join('\n')}`
          : undefined;

        const stream = chat({
          adapter: geminiText(model, {
            apiKey: process.env.GEMINI_API_KEY,
          }),
          systemPrompts: calendarContextPrompt
            ? [SYSTEM_PROMPT, calendarContextPrompt]
            : [SYSTEM_PROMPT],
          messages,
          tools,
          conversationId: finalConversationId || sessionId,
        });

        let assistantMessageId: string | undefined;
        const assistantMessageParts: any[] = [];

        const wrappedStream = (async function* () {
          for await (const chunk of stream) {
            if (chunk.type === "content" && chunk.content) {
              if (!assistantMessageId) {
                assistantMessageId = crypto.randomUUID();
              }
              assistantMessageParts.push({ type: "text", content: chunk.content });
            } else if (chunk.type === "tool_call") {
              if (!assistantMessageId) {
                assistantMessageId = crypto.randomUUID();
              }
              const toolCall = chunk.toolCall;
              assistantMessageParts.push({
                type: "tool-call",
                id: toolCall.id,
                name: toolCall.function.name,
                arguments: toolCall.function.arguments,
                state: "input-complete",
              });
            } else if (chunk.type === "tool_result") {
              assistantMessageParts.push({
                type: "tool-result",
                toolCallId: chunk.toolCallId,
                content: chunk.content,
                state: "complete",
              });
            }
            yield chunk;
          }

          if (assistantMessageId && assistantMessageParts.length > 0) {
            await addChatMessage(
              assistantMessageId,
              sessionId,
              "assistant",
              assistantMessageParts
            );
          }
        })();

        const abortController = new AbortController();
        const readableStream = toServerSentEventsStream(wrappedStream, abortController);
        
        return new Response(readableStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
