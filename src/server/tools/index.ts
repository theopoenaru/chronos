import { createGetCalendarEventsTool } from "./getCalendarEvents";
import { createSummarizeCalendarTool } from "./summarizeCalendar";
import { createAnalyzeAvailabilityTool } from "./analyzeAvailability";

export function createServerTools(userId: string) {
  return [
    createGetCalendarEventsTool(userId),
    createSummarizeCalendarTool(),
    createAnalyzeAvailabilityTool(),
  ];
}

