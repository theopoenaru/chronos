import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import { fetchCalendarEvents } from "@/server/google/calendarClient";
import { normalizeGoogleEvents } from "@/server/google/normalize";

const inputSchema = z.object({
  calendarId: z.string().default("primary").describe("Calendar ID to query"),
  timeMin: z.string().describe("ISO 8601 datetime string for start of range"),
  timeMax: z.string().describe("ISO 8601 datetime string for end of range"),
  query: z.string().optional().describe("Optional search query to filter events by title"),
  maxResults: z.number().int().min(1).max(50).default(50).describe("Maximum number of events to return"),
});

const attendeeSchema = z.object({
  email: z.string(),
  displayName: z.string().optional(),
  responseStatus: z.enum(["needsAction", "declined", "tentative", "accepted"]).optional(),
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
      attendees: z.array(attendeeSchema).optional(),
      location: z.string().optional(),
      description: z.string().optional(),
      colorId: z.string().optional(),
      calendarId: z.string().optional(),
    })
  ),
});

export const calendarListEventsToolDefinition = toolDefinition({
  name: "calendar_list_events",
  description: "List calendar events in a time window. Use for counting meetings, summaries, or finding candidates.",
  inputSchema,
  outputSchema,
});

export function createCalendarListEventsTool(userId: string) {
  return calendarListEventsToolDefinition.server(async (params) => {
    const events = await fetchCalendarEvents(
      userId,
      new Date(params.timeMin),
      new Date(params.timeMax),
      { calendarId: params.calendarId, query: params.query, maxResults: params.maxResults }
    );

    return {
      events: normalizeGoogleEvents(events).map((event) => ({
        ...event,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
      })),
    };
  });
}
