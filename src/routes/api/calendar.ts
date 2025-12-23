import { createFileRoute } from "@tanstack/react-router";
import { requireSession } from "@/server/auth/session";
import { fetchCalendarEvents } from "@/server/google/calendarClient";
import { normalizeGoogleEvents } from "@/server/google/normalize";

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

        const googleEvents = await fetchCalendarEvents(
          session.user.id,
          new Date(timeMin),
          new Date(timeMax),
        );

        const events = normalizeGoogleEvents(googleEvents);

        const serializedEvents = events.map((event) => ({
          ...event,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
        }));

        return new Response(JSON.stringify({ events: serializedEvents }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
