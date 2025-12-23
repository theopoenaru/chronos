export type CalendarEvent = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  allDay: boolean;
};

export type TimeSlot = {
  start: Date;
  end: Date;
  score: number; // ranking for recommendations
};

export type FreeBusyBlock = {
  start: Date;
  end: Date;
  busy: boolean;
};

