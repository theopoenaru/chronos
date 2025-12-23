import type { CalendarEvent } from "./types";

export function hasOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
  return event1.startTime < event2.endTime && event2.startTime < event1.endTime;
}

export function findConflicts(events: CalendarEvent[]): CalendarEvent[][] {
  const conflicts: CalendarEvent[][] = [];
  const processed = new Set<string>();

  for (let i = 0; i < events.length; i++) {
    if (processed.has(events[i].id)) continue;

    const conflictGroup: CalendarEvent[] = [events[i]];
    processed.add(events[i].id);

    for (let j = i + 1; j < events.length; j++) {
      if (processed.has(events[j].id)) continue;

      if (hasOverlap(events[i], events[j])) {
        conflictGroup.push(events[j]);
        processed.add(events[j].id);
      }
    }

    if (conflictGroup.length > 1) {
      conflicts.push(conflictGroup);
    }
  }

  return conflicts;
}

