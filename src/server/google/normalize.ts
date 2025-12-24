import type { CalendarEvent, CalendarEventAttendee } from "@/core/calendar/types";
import type { GoogleCalendarEvent } from "./calendarClient";

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

      const attendees: CalendarEventAttendee[] | undefined = event.attendees
        ? event.attendees.map((attendee) => ({
            email: attendee.email,
            displayName: attendee.displayName,
            responseStatus: attendee.responseStatus as
              | "needsAction"
              | "declined"
              | "tentative"
              | "accepted"
              | undefined,
          }))
        : undefined;

      return {
        id: event.id,
        title: event.summary || "(No title)",
        startTime,
        endTime,
        timezone,
        allDay: isAllDay,
        attendees,
        location: event.location,
        description: event.description,
        colorId: event.colorId,
        calendarId: "primary",
      };
    });
}

