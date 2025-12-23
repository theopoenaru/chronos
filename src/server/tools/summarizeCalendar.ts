import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import type { CalendarEvent } from "@/core/calendar/types";
import { computeFreeBusy } from "@/core/calendar/availability";
import { findConflicts } from "@/core/calendar/overlap";

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
  timezone: z.string().describe("IANA timezone identifier"),
});

const outputSchema = z.object({
  freeBusy: z.array(
    z.object({
      start: z.string(),
      end: z.string(),
      busy: z.boolean(),
    })
  ),
  conflicts: z.array(z.array(calendarEventSchema)),
});

export const summarizeCalendarToolDefinition = toolDefinition({
  name: "summarize_calendar",
  description: "Summarize calendar events into free/busy blocks and conflicts",
  inputSchema,
  outputSchema,
});

export function createSummarizeCalendarTool() {
  return summarizeCalendarToolDefinition.server(async (params) => {
    // Convert ISO strings back to Date objects for processing
    const events: CalendarEvent[] = params.events.map((event) => ({
      id: event.id,
      title: event.title,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      timezone: event.timezone,
      allDay: event.allDay,
    }));

    // Find the time range from events
    if (events.length === 0) {
      return {
        freeBusy: [],
        conflicts: [],
      };
    }

    const startTime = new Date(
      Math.min(...events.map((e) => e.startTime.getTime()))
    );
    const endTime = new Date(
      Math.max(...events.map((e) => e.endTime.getTime()))
    );

    // Compute free/busy blocks
    const freeBusyBlocks = computeFreeBusy(events, startTime, endTime);

    // Find conflicts
    const conflicts = findConflicts(events);

    return {
      freeBusy: freeBusyBlocks.map((block) => ({
        start: block.start.toISOString(),
        end: block.end.toISOString(),
        busy: block.busy,
      })),
      conflicts: conflicts.map((conflictGroup) =>
        conflictGroup.map((event) => ({
          id: event.id,
          title: event.title,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
          timezone: event.timezone,
          allDay: event.allDay,
        }))
      ),
    };
  });
}
