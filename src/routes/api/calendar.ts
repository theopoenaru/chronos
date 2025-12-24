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

        try {
          const events = await fetchCalendarEvents(
            session.user.id,
            new Date(timeMin),
            new Date(timeMax),
          );

          return new Response(JSON.stringify({ 
            events: normalizeGoogleEvents(events).map((event) => ({
              ...event,
              startTime: event.startTime.toISOString(),
              endTime: event.endTime.toISOString(),
            }))
          }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          if (error.code === "OAUTH_TOKEN_INVALID") {
            return new Response(
              JSON.stringify({ error: "OAUTH_TOKEN_INVALID", message: "Google OAuth token invalid. Please re-authenticate." }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }
          if (error.code === "CALENDAR_ACCESS_FORBIDDEN") {
            return new Response(
              JSON.stringify({ 
                error: "CALENDAR_ACCESS_FORBIDDEN", 
                message: "Google Calendar API access forbidden. Please check your API permissions and scopes." 
              }),
              { status: 403, headers: { "Content-Type": "application/json" } }
            );
          }
          console.error("Calendar API error:", error);
          return new Response(
            JSON.stringify({ error: "CALENDAR_API_ERROR", message: error.message || "Failed to fetch calendar events" }),
            { status: error.status || 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
