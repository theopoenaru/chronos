import { createCalendarListEventsTool } from "./getCalendarEvents";
import { createCalendarFreeBusyTool } from "./freeBusy";

export function createServerTools(userId: string) {
  return [
    createCalendarListEventsTool(userId),
    createCalendarFreeBusyTool(userId),
  ];
}

