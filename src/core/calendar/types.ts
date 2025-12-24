export type CalendarEventAttendee = {
  email: string;
  displayName?: string;
  responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
};

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  allDay: boolean;
  attendees?: CalendarEventAttendee[];
  location?: string;
  description?: string;
  colorId?: string;
  calendarId?: string;
};

