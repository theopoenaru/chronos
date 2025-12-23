import { chat, toStreamResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";

const MAX_MESSAGE_LENGTH = 10000;
const MAX_MESSAGES = 100;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.GEMINI_API_KEY) {
          return new Response(
            JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const body = await request.json();
        const { messages, conversationId } = body;

        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response(
            JSON.stringify({ error: "Invalid messages" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        if (messages.length > MAX_MESSAGES) {
          return new Response(
            JSON.stringify({ error: "Too many messages" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        for (const message of messages) {
          if (
            typeof message.content !== "string" ||
            message.content.length > MAX_MESSAGE_LENGTH
          ) {
            return new Response(
              JSON.stringify({ error: "Invalid message content" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }
        }

        const stream = chat({
          adapter: geminiText("gemini-1.5-pro", {
            apiKey: process.env.GEMINI_API_KEY,
          }),
          messages,
          conversationId,
        });

        return toStreamResponse(stream);
      },
    },
  },
});

