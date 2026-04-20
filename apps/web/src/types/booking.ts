export interface EventType {
  id: string;
  title: string;
  durationMinutes: number;
  description?: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
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

export interface PublicOwner {
  name: string;
  description?: string;
  avatar?: string;
  bookingMonthsAhead?: number;
  timezone: string;
}

export interface WorkingHours {
  id: string;
  weekday: string;
  startTime: string;
  endTime: string;
}

export interface CreateBookingRequest {
  eventTypeId: string;
  startTime: string;
  guest: Guest;
}

export type BookingStep = 'event-type' | 'slot-picker' | 'success';

export interface BookingState {
  step: BookingStep;
  selectedEventType: EventType | null;
  selectedDate: Date;
  selectedSlot: AvailableSlot | null;
  guestInfo: Guest | null;
}
