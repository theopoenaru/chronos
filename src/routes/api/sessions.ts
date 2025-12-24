import { createFileRoute } from "@tanstack/react-router";
import { requireSession } from "@/server/auth/session";
import {
  getChatSessions,
  getChatMessages,
  createChatSession,
} from "@/server/db/queries";

export const Route = createFileRoute("/api/sessions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await requireSession(request);
        const userId = session.user.id;

        const url = new URL(request.url);
        const sessionId = url.searchParams.get("id");

        if (sessionId) {
          // Get messages for a specific session
          const messages = await getChatMessages(sessionId);
          return new Response(JSON.stringify({ messages }), {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          // List all sessions for the user
          const sessions = await getChatSessions(userId);
          return new Response(
            JSON.stringify({
              sessions: sessions.map((s) => ({
                id: s.id,
                title: s.title,
                updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
              })),
            }),
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
      POST: async ({ request }) => {
        const session = await requireSession(request);
        const userId = session.user.id;

        const body = await request.json().catch(() => ({}));
        const { title } = body as { title?: string };

        const sessionId = await createChatSession(userId, title);

        return new Response(
          JSON.stringify({
            id: sessionId,
            title: title || null,
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      },
    },
  },
});

