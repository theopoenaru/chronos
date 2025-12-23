import type { CalendarEvent, TimeSlot, FreeBusyBlock } from "./types";

export function computeFreeBusy(
  events: CalendarEvent[],
  start: Date,
  end: Date,
): FreeBusyBlock[] {
  const blocks: FreeBusyBlock[] = [];
  let current = new Date(start);

  // Sort events by start time
  const sortedEvents = [...events].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );

  for (const event of sortedEvents) {
    if (event.endTime <= start || event.startTime >= end) continue;

    // Add free block before event
    if (current < event.startTime) {
      blocks.push({
        start: new Date(current),
        end: new Date(event.startTime),
        busy: false,
      });
    }

    // Add busy block for event
    blocks.push({
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      busy: true,
    });

    current = event.endTime > current ? event.endTime : current;
  }

  // Add final free block
  if (current < end) {
    blocks.push({
      start: new Date(current),
      end: new Date(end),
      busy: false,
    });
  }

  return blocks;
}

export function findAvailableSlots(
  events: CalendarEvent[],
  durationMinutes: number,
  start: Date,
  end: Date,
  workHours?: { start: number; end: number }, // 0-23
): TimeSlot[] {
  const freeBusy = computeFreeBusy(events, start, end);
  const slots: TimeSlot[] = [];

  for (const block of freeBusy) {
    if (block.busy) continue;

    const blockDuration = (block.end.getTime() - block.start.getTime()) / (1000 * 60);
    if (blockDuration < durationMinutes) continue;

    // Check work hours if provided
    if (workHours) {
      const blockStartHour = block.start.getHours();
      const blockEndHour = block.end.getHours();
      if (
        blockStartHour < workHours.start ||
        blockEndHour > workHours.end
      ) {
        continue;
      }
    }

    // Generate slots within this free block
    let slotStart = new Date(block.start);
    while (slotStart.getTime() + durationMinutes * 60 * 1000 <= block.end.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
      slots.push({
        start: new Date(slotStart),
        end: slotEnd,
        score: scoreSlot(slotStart, slotEnd, events),
      });
      slotStart = new Date(slotStart.getTime() + 30 * 60 * 1000); // 30 min increments
    }
  }

  return slots.sort((a, b) => b.score - a.score);
}

function scoreSlot(start: Date, end: Date, events: CalendarEvent[]): number {
  let score = 100;

  // Prefer morning slots (9-11 AM)
  const hour = start.getHours();
  if (hour >= 9 && hour < 11) score += 20;

  // Prefer slots with buffer before/after
  const hasBufferBefore = !events.some(
    (e) => e.endTime > start && e.endTime <= new Date(start.getTime() + 30 * 60 * 1000),
  );
  const hasBufferAfter = !events.some(
    (e) => e.startTime < end && e.startTime >= new Date(end.getTime() - 30 * 60 * 1000),
  );
  if (hasBufferBefore) score += 10;
  if (hasBufferAfter) score += 10;

  return score;
}

