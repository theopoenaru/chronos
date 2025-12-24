import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import { fetchFreeBusy } from "@/server/google/calendarClient";

const inputSchema = z.object({
  calendarIds: z.array(z.string()).default(["primary"]).describe("Array of calendar IDs to check"),
  timeMin: z.string().describe("ISO 8601 datetime string for start of range"),
  timeMax: z.string().describe("ISO 8601 datetime string for end of range"),
});

const outputSchema = z.object({
  calendars: z.record(
    z.string(),
    z.object({
      busy: z.array(
        z.object({
          start: z.string(),
          end: z.string(),
        })
      ),
    })
  ),
});

export const calendarFreeBusyToolDefinition = toolDefinition({
  name: "calendar_freebusy",
  description: "Return busy time ranges in a window. Use to find focus blocks or explain why someone is busy.",
  inputSchema,
  outputSchema,
});

export function createCalendarFreeBusyTool(userId: string) {
  return calendarFreeBusyToolDefinition.server(async (params) => {
    return fetchFreeBusy(
      userId,
      params.calendarIds,
      new Date(params.timeMin),
      new Date(params.timeMax)
    );
  });
}

