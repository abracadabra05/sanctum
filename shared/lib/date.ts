export const DAY_MS = 24 * 60 * 60 * 1000;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type LocaleInput = Intl.LocalesArgument;

export const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_VALUE_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

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

export const isValidDateKey = (value: string) =>
  DATE_KEY_PATTERN.test(value) && toDateKey(fromDateKey(value)) === value;

export const isValidTimeValue = (value: string) =>
  TIME_VALUE_PATTERN.test(value);

export const compareDateKeys = (left: string, right: string) => {
  const leftDate = fromDateKey(left).getTime();
  const rightDate = fromDateKey(right).getTime();
  return leftDate - rightDate;
};

export const shiftDateKey = (value: string, amount: number) => {
  if (!isValidDateKey(value)) {
    return toDateKey(addDays(new Date(), amount));
  }

  return toDateKey(addDays(fromDateKey(value), amount));
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

export const getOrderedWeekdays = (weekStartsOn: Weekday) =>
  Array.from(
    { length: 7 },
    (_, index) => ((weekStartsOn + index) % 7) as Weekday,
  );

export const formatWeekdayLabel = (
  weekday: Weekday,
  style: 'short' | 'long' = 'short',
  locale?: LocaleInput,
) => {
  const referenceDate = new Date(2026, 0, 4 + weekday);
  return referenceDate.toLocaleDateString(locale, { weekday: style });
};

export const formatTimeLabel = (
  value: string,
  format: '12h' | '24h',
  locale?: LocaleInput,
) => {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
  });
};

export const formatDateLabel = (
  value: Date,
  options: {
    includeWeekday?: boolean;
    includeYear?: boolean;
    locale?: LocaleInput;
  } = {},
) =>
  value.toLocaleDateString(options.locale, {
    weekday: options.includeWeekday ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
    year: options.includeYear ? 'numeric' : undefined,
  });

export const formatDateKeyLabel = (
  value: string,
  options: {
    includeWeekday?: boolean;
    includeYear?: boolean;
    locale?: LocaleInput;
  } = {},
) =>
  isValidDateKey(value) ? formatDateLabel(fromDateKey(value), options) : value;

export const formatOccurrenceLabel = (
  occurrenceDate: string,
  time: string,
  format: '12h' | '24h',
  options: {
    todayKey?: string;
    todayLabel?: string;
    locale?: LocaleInput;
  } = {},
) => {
  const todayKey = options.todayKey ?? toDateKey(new Date());
  const prefix =
    occurrenceDate === todayKey
      ? (options.todayLabel ?? 'Today')
      : formatDateKeyLabel(occurrenceDate, {
          includeWeekday: true,
          locale: options.locale,
        });

  return `${prefix} • ${formatTimeLabel(time, format, options.locale)}`;
};

export const formatDateTimeLabel = (
  value: string,
  format: '12h' | '24h',
  options: {
    includeWeekday?: boolean;
    includeYear?: boolean;
    locale?: LocaleInput;
  } = {},
) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${formatDateLabel(date, options)} • ${formatTimeLabel(extractLocalTime(value), format, options.locale)}`;
};

export const parseTimeValue = (value: string) => {
  if (!isValidTimeValue(value)) {
    return null;
  }

  const [hours, minutes] = value.split(':').map(Number);
  return { hours, minutes };
};

export const tryCombineDateAndTime = (dateKey: string, time: string) => {
  if (!isValidDateKey(dateKey) || !isValidTimeValue(time)) {
    return null;
  }

  const [year, month, day] = dateKey.split('-').map(Number);
  const { hours, minutes } = parseTimeValue(time)!;
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
};

export const combineDateAndTime = (dateKey: string, time: string) => {
  const combined = tryCombineDateAndTime(dateKey, time);
  if (!combined) {
    throw new Error(`Invalid date/time input: ${dateKey} ${time}`);
  }

  return combined;
};

export const extractLocalTime = (dateIso: string) => {
  const date = new Date(dateIso);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const shiftTimeValue = (value: string, amountMinutes: number) => {
  const parsed = parseTimeValue(value);
  if (!parsed) {
    return '08:00';
  }

  const date = new Date();
  date.setHours(parsed.hours, parsed.minutes, 0, 0);
  return extractLocalTime(addMinutes(date, amountMinutes).toISOString());
};

export const isAfterClockTime = (date: Date, cutoff: string) => {
  const [hours, minutes] = cutoff.split(':').map(Number);
  const copy = new Date(date);
  copy.setHours(hours, minutes, 0, 0);
  return date.getTime() >= copy.getTime();
};
