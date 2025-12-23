import { useState, useEffect } from "react";
import {
  MiniCalendar as KiboMiniCalendar,
  MiniCalendarNavigation,
  MiniCalendarDays,
  MiniCalendarDay,
} from "@/components/kibo-ui/mini-calendar";

type MiniCalendarProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export function MiniCalendar({ selectedDate, onSelectDate }: MiniCalendarProps) {
  const [startDate, setStartDate] = useState<Date>(selectedDate);

  useEffect(() => {
    // Recenter only if selected date falls outside visible range [startDate, startDate+4]
    const daysDiff = Math.floor(
      (selectedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff < 0 || daysDiff >= 5) {
      setStartDate(selectedDate);
    }
  }, [selectedDate]);

  return (
    <KiboMiniCalendar
      value={selectedDate}
      onValueChange={(date) => date && onSelectDate(date)}
      days={5}
      startDate={startDate}
      onStartDateChange={(date) => date && setStartDate(date)}
    >
      <MiniCalendarNavigation direction="prev" />
      <MiniCalendarDays>
        {(date) => <MiniCalendarDay key={date.toISOString()} date={date} />}
      </MiniCalendarDays>
      <MiniCalendarNavigation direction="next" />
    </KiboMiniCalendar>
  );
}

