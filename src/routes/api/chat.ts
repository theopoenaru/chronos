import { chat, toServerSentEventsStream } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";
import { requireSession } from "@/server/auth/session";
import { SYSTEM_PROMPT } from "@/server/llm/systemPrompt";
import { createServerTools } from "@/server/tools";

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
        const calendarContextPrompt =
          selectedDate && timezone
            ? `CALENDAR_CONTEXT\n- SelectedDate: ${selectedDate}\n- Timezone: ${timezone}\nInterpret relative dates (today/tomorrow) relative to SelectedDate unless the user specifies otherwise.`
            : selectedDate
              ? `CALENDAR_CONTEXT\n- SelectedDate: ${selectedDate}\nInterpret relative dates (today/tomorrow) relative to SelectedDate unless the user specifies otherwise.`
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

        const abortController = new AbortController();
        const readableStream = toServerSentEventsStream(stream, abortController);
        
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
