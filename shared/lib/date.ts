export const DAY_MS = 24 * 60 * 60 * 1000;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const startOfDay = (value: Date) => {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const toDateKey = (value: Date) => {
  const normalized = startOfDay(value);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = String(normalized.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const fromDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isSameDay = (left: Date, right: Date) =>
  startOfDay(left).getTime() === startOfDay(right).getTime();

export const addDays = (value: Date, amount: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
};

export const addMinutes = (value: Date, amount: number) => {
  const next = new Date(value);
  next.setMinutes(next.getMinutes() + amount);
  return next;
};

export const getWeekday = (value: Date): Weekday => value.getDay() as Weekday;

export const formatTimeLabel = (value: string, format: '12h' | '24h') => {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
  });
};

export const combineDateAndTime = (dateKey: string, time: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
};

export const extractLocalTime = (dateIso: string) => {
  const date = new Date(dateIso);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const isAfterClockTime = (date: Date, cutoff: string) => {
  const [hours, minutes] = cutoff.split(':').map(Number);
  const copy = new Date(date);
  copy.setHours(hours, minutes, 0, 0);
  return date.getTime() >= copy.getTime();
};
