import type { CalendarEvent } from "@/core/calendar/types";

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status?: string;
};

// Transform Google Calendar API response to domain model
export function normalizeGoogleEvents(
  googleEvents: GoogleCalendarEvent[]
): CalendarEvent[] {
  return googleEvents
    .filter((event) => event.status !== "cancelled")
    .map((event) => {
      const isAllDay = !!event.start.date;
      const timezone = event.start.timeZone || "UTC";

      let startTime: Date;
      if (event.start.dateTime) {
        startTime = new Date(event.start.dateTime);
      } else if (event.start.date) {
        startTime = new Date(event.start.date + "T00:00:00");
      } else {
        throw new Error("Event missing start time");
      }

      let endTime: Date;
      if (event.end.dateTime) {
        endTime = new Date(event.end.dateTime);
      } else if (event.end.date) {
        const endDate = new Date(event.end.date);
        endDate.setDate(endDate.getDate() - 1);
        endTime = new Date(endDate.toISOString().split("T")[0] + "T23:59:59");
      } else {
        throw new Error("Event missing end time");
      }

      return {
        id: event.id,
        title: event.summary || "(No title)",
        startTime,
        endTime,
        timezone,
        allDay: isAllDay,
      };
    });
}

