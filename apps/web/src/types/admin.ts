/**
 * Admin dashboard types
 * Full models including sensitive data and time-offs
 */

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface WorkingHoursTimeOff {
  id: string;
  startDateTime: string;
  endDateTime: string;
}

export interface WorkingHours {
  id: string;
  weekday: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface Owner {
  name: string;
  email: string;
  description?: string;
  avatar?: string;
  bookingMonthsAhead?: number;
  /** Timezone for displaying dates (IANA format) */
  timezone: string;
}

export interface EventType {
  id: string;
  title: string;
  durationMinutes: number;
  description?: string;
}

export interface Guest {
  name: string;
  email: string;
}

export interface Booking {
  id: string;
  eventType: EventType;
  startTime: string;
  endTime: string;
  guest: Guest;
}

export interface BookingListResponse {
  bookings: Booking[];
}

export interface TimeOffListResponse {
  timeOffs: WorkingHoursTimeOff[];
}

export interface WorkingHoursListResponse {
  workingHours: WorkingHours[];
}

export interface BookingStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalDurationToday: number; // in minutes
}

export interface DateRangeFilter {
  dateFrom: string;
  dateTo: string;
}


// ...удалены дублирующиеся интерфейсы EventType, Guest, Booking, BookingListResponse, TimeOffListResponse, BookingStats, DateRangeFilter...

export interface Guest {
  name: string;
  email: string;
}

export interface Booking {
  id: string;
  eventType: EventType;
  startTime: string;
  endTime: string;
  guest: Guest;
}

export interface BookingListResponse {
  bookings: Booking[];
}

export interface TimeOffListResponse {
  timeOffs: WorkingHoursTimeOff[];
}

export interface BookingStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalDurationToday: number; // in minutes
}

export interface DateRangeFilter {
  dateFrom: string;
  dateTo: string;
}
