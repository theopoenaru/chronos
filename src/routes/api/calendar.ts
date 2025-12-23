import { createFileRoute } from "@tanstack/react-router";
import { requireSession } from "@/server/auth/session";
import { getCalendarEvents } from "@/server/db/queries";

export const Route = createFileRoute("/api/calendar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await requireSession(request);
        const url = new URL(request.url);
        const timeMin = url.searchParams.get("time_min");
        const timeMax = url.searchParams.get("time_max");

        if (!timeMin || !timeMax) {
          return new Response(
            JSON.stringify({ error: "time_min and time_max required" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const events = await getCalendarEvents(
          session.user.id,
          new Date(timeMin),
          new Date(timeMax),
        );

        return new Response(JSON.stringify({ events }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
