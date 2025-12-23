import type { CalendarEvent } from "@/core/calendar/types";

// Transform Google Calendar API response to domain model
export function normalizeGoogleEvent(googleEvent: unknown): CalendarEvent {
  // TODO: implement normalization
  // - Map Google event fields to CalendarEvent
  // - Handle timezone conversion
  // - Extract title, start, end, etc.
  throw new Error("Not implemented");
}

export function normalizeGoogleEvents(googleEvents: unknown[]): CalendarEvent[] {
  // TODO: implement batch normalization
  return [];
}

