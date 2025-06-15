let eventGuid = 0;

export function createEventId(): string {
  return String(eventGuid++);
}

const todayStr: string = new Date().toISOString().replace(/T.*$/, '');

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
}

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: createEventId(),
    title: 'All-day event',
    start: todayStr,
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: `${todayStr}T12:00:00`,
  },
];
