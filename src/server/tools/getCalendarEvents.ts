import type { CalendarEvent } from "@/core/calendar/types";
import { getCalendarEvents as getCachedEvents } from "@/server/db/queries";
import { fetchCalendarEvents } from "@/server/google/calendarClient";
import { normalizeGoogleEvents } from "@/server/google/normalize";

export const getCalendarEventsTool = {
  name: "get_calendar_events",
  description: "Fetch calendar events for a time range",
  parameters: {
    type: "object",
    properties: {
      time_min: {
        type: "string",
        description: "ISO 8601 datetime string for start of range",
      },
      time_max: {
        type: "string",
        description: "ISO 8601 datetime string for end of range",
      },
      timezone: {
        type: "string",
        description: "IANA timezone identifier (e.g., 'America/New_York')",
      },
    },
    required: ["time_min", "time_max", "timezone"],
  },
  execute: async (params: {
    time_min: string;
    time_max: string;
    timezone: string;
  }): Promise<{ events: CalendarEvent[] }> => {
    // TODO: implement
    // - Check cache first
    // - Fetch from Google if needed
    // - Normalize and return
    const timeMin = new Date(params.time_min);
    const timeMax = new Date(params.time_max);
    // const cached = await getCachedEvents(userId, timeMin, timeMax);
    // if (cached.length > 0) return { events: cached };
    // const googleEvents = await fetchCalendarEvents(userId, timeMin, timeMax);
    // return { events: normalizeGoogleEvents(googleEvents) };
    return { events: [] };
  },
};

