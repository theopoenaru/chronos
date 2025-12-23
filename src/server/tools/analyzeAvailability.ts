import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import type { CalendarEvent, TimeSlot } from "@/core/calendar/types";
import { findAvailableSlots } from "@/core/calendar/availability";

const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  timezone: z.string(),
  allDay: z.boolean(),
});

const inputSchema = z.object({
  events: z.array(calendarEventSchema).describe("Array of calendar events"),
  duration_minutes: z.number().describe("Required duration in minutes"),
  time_min: z.string().describe("ISO 8601 datetime string for start of search window"),
  time_max: z.string().describe("ISO 8601 datetime string for end of search window"),
  timezone: z.string().describe("IANA timezone identifier"),
});

const outputSchema = z.object({
  slots: z.array(
    z.object({
      start: z.string(),
      end: z.string(),
      score: z.number(),
    })
  ),
});

export const analyzeAvailabilityToolDefinition = toolDefinition({
  name: "analyze_availability",
  description: "Find available time slots that satisfy constraints",
  inputSchema,
  outputSchema,
});

export function createAnalyzeAvailabilityTool() {
  return analyzeAvailabilityToolDefinition.server(async (params) => {
    // Convert ISO strings back to Date objects
    const events: CalendarEvent[] = params.events.map((event) => ({
      id: event.id,
      title: event.title,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      timezone: event.timezone,
      allDay: event.allDay,
    }));

    const timeMin = new Date(params.time_min);
    const timeMax = new Date(params.time_max);

    const slots = findAvailableSlots(
      events,
      params.duration_minutes,
      timeMin,
      timeMax,
    );

    // Return top 5 slots
    return {
      slots: slots.slice(0, 5).map((slot) => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        score: slot.score,
      })),
    };
  });
}
