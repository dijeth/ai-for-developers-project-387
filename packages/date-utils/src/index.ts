import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function utcNow(): Date {
  return dayjs.utc().toDate();
}

export function fromISO(isoString: string): Date {
  return dayjs.utc(isoString).toDate();
}

export function toISO(date: Date): string {
  return dayjs(date).utc().toISOString();
}

export function getUTCYear(date: Date): number {
  return dayjs(date).utc().year();
}

export function getUTCMonth(date: Date): number {
  return dayjs(date).utc().month();
}

export function getUTCDate(date: Date): number {
  return dayjs(date).utc().date();
}

export function getUTCDay(date: Date): number {
  return dayjs(date).utc().day();
}

export function getUTCHours(date: Date): number {
  return dayjs(date).utc().hour();
}

export function getUTCMinutes(date: Date): number {
  return dayjs(date).utc().minute();
}

export function setUTCHours(date: Date, hours: number, minutes?: number, seconds?: number, ms?: number): Date {
  return dayjs(date)
    .utc()
    .set('hour', hours)
    .set('minute', minutes ?? 0)
    .set('second', seconds ?? 0)
    .set('millisecond', ms ?? 0)
    .toDate();
}

export function setUTCDate(date: Date, year: number, month: number, day: number): Date {
  return dayjs(date)
    .utc()
    .set('year', year)
    .set('month', month)
    .set('date', day)
    .toDate();
}

export function addUTCDays(date: Date, days: number): Date {
  return dayjs(date).utc().add(days, 'day').toDate();
}

export function addUTCMonths(date: Date, months: number): Date {
  return dayjs(date).utc().add(months, 'month').toDate();
}

export function startOfUTCDay(date: Date): Date {
  return dayjs(date).utc().startOf('day').toDate();
}

export function endOfUTCDay(date: Date): Date {
  return dayjs(date).utc().endOf('day').toDate();
}

export function startOfUTCWeek(date: Date): Date {
  return dayjs(date).utc().startOf('week').toDate();
}

export function isUTCBefore(a: Date, b: Date): boolean {
  return dayjs(a).utc().isBefore(dayjs(b).utc());
}

export function isUTCAfter(a: Date, b: Date): boolean {
  return dayjs(a).utc().isAfter(dayjs(b).utc());
}

export function isSameUTCDay(a: Date, b: Date): boolean {
  return dayjs(a).utc().isSame(dayjs(b).utc(), 'day');
}

export function isUTCPast(date: Date): boolean {
  return dayjs(date).utc().isBefore(utcNow());
}

export function isUTCFuture(date: Date): boolean {
  return dayjs(date).utc().isAfter(utcNow());
}

export function formatUTCDate(date: Date): string {
  return dayjs(date).utc().format('YYYY-MM-DD');
}

export function formatUTCTime(date: Date): string {
  return dayjs(date).utc().format('HH:mm');
}

export function convertLocalTimeToUTC(date: Date, timeStr: string, timeZone: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const dateStr = formatUTCDate(date);

  return dayjs.tz(
    `${dateStr} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`,
    timeZone,
  ).utc().toDate();
}

export function getDayOfWeekInTimezone(date: Date, timeZone: string): number {
  return dayjs(date).tz(timeZone).day();
}