import type { CalendarEvent, TimeSlot } from "@/core/calendar/types";
import { findAvailableSlots } from "@/core/calendar/availability";

export const analyzeAvailabilityTool = {
  name: "analyze_availability",
  description: "Find available time slots that satisfy constraints",
  parameters: {
    type: "object",
    properties: {
      events: {
        type: "array",
        description: "Array of calendar events",
      },
      duration_minutes: {
        type: "number",
        description: "Required duration in minutes",
      },
      time_min: {
        type: "string",
        description: "ISO 8601 datetime string for start of search window",
      },
      time_max: {
        type: "string",
        description: "ISO 8601 datetime string for end of search window",
      },
      timezone: {
        type: "string",
        description: "IANA timezone identifier",
      },
    },
    required: ["events", "duration_minutes", "time_min", "time_max", "timezone"],
  },
  execute: async (params: {
    events: CalendarEvent[];
    duration_minutes: number;
    time_min: string;
    time_max: string;
    timezone: string;
  }): Promise<{ slots: TimeSlot[] }> => {
    // TODO: implement
    // - Parse time range
    // - Find available slots
    // - Rank and return top candidates
    const timeMin = new Date(params.time_min);
    const timeMax = new Date(params.time_max);
    const slots = findAvailableSlots(
      params.events,
      params.duration_minutes,
      timeMin,
      timeMax,
    );
    return { slots: slots.slice(0, 5) }; // Top 5
  },
};

