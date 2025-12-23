import { chat, toStreamResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";
import { requireSession } from "@/server/auth/session";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (process.env.NODE_ENV !== "development") {
          await requireSession(request);
        }

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
        const { messages, conversationId } = body;

        const stream = chat({
          adapter: geminiText("gemini-2.0-flash", {
            apiKey: process.env.GEMINI_API_KEY,
          }),
          messages,
          conversationId: conversationId || sessionId,
        });

        return toStreamResponse(stream);
      },
    },
  },
});

