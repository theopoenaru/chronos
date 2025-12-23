import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { formatTime } from "@/core/time/timezone";
import { Clock } from "lucide-react";
import type { CalendarEvent } from "@/core/calendar/types";

type CalendarDayListProps = {
  events: CalendarEvent[];
  selectedDate: Date;
  timezone: string;
};

const EVENT_COLORS = [
  "bg-blue-500",
  "bg-sky-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
];

export function CalendarDayList({
  events,
  selectedDate,
  timezone,
}: CalendarDayListProps) {
  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.startTime);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <>
      <div className="border-b p-4 bg-muted/30">
        <h2 className="chronos-heading text-base">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"} scheduled
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {dayEvents.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle className="text-base font-semibold">No events</EmptyTitle>
              <EmptyDescription className="text-sm text-muted-foreground">
                You have no events scheduled for this day.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {dayEvents.map((event, idx) => (
              <Card
                key={event.id}
                className="chronos-card event-card"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    EVENT_COLORS[idx % EVENT_COLORS.length]
                  }`}
                />
                <CardHeader className="pb-1.5 pl-3">
                  <CardTitle className="text-sm font-medium">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="pl-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatTime(event.startTime, timezone)} -{" "}
                      {formatTime(event.endTime, timezone)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

