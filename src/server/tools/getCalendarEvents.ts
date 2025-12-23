import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import { getCalendarEvents as getCachedEvents } from "@/server/db/queries";
import { fetchCalendarEvents } from "@/server/google/calendarClient";
import { normalizeGoogleEvents } from "@/server/google/normalize";

const inputSchema = z.object({
  time_min: z.string().describe("ISO 8601 datetime string for start of range"),
  time_max: z.string().describe("ISO 8601 datetime string for end of range"),
  timezone: z.string().describe("IANA timezone identifier (e.g., 'America/New_York')"),
});

const outputSchema = z.object({
  events: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      timezone: z.string(),
      allDay: z.boolean(),
    })
  ),
});

export const getCalendarEventsToolDefinition = toolDefinition({
  name: "get_calendar_events",
  description: "Fetch calendar events for a time range",
  inputSchema,
  outputSchema,
});

export function createGetCalendarEventsTool(userId: string) {
  return getCalendarEventsToolDefinition.server(async (params) => {
    const timeMin = new Date(params.time_min);
    const timeMax = new Date(params.time_max);

    const cached = await getCachedEvents(userId, timeMin, timeMax);
    if (cached.length > 0) {
      return {
        events: cached.map((event) => ({
          id: event.id,
          title: event.title ?? "(No title)",
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
          timezone: event.timezone ?? params.timezone ?? "UTC",
          allDay: event.allDay ?? false,
        })),
      };
    }

    const googleEvents = await fetchCalendarEvents(userId, timeMin, timeMax);
    const normalizedEvents = normalizeGoogleEvents(googleEvents);

    return {
      events: normalizedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        timezone: event.timezone,
        allDay: event.allDay,
      })),
    };
  });
}
