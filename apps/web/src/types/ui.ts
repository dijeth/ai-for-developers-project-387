/**
 * UI-specific types (not in OpenAPI spec)
 */

import type { EventType, Guest, AvailableSlot } from '../api/types'

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type BookingStep = 'event-type' | 'slot-picker' | 'success'

export interface BookingState {
  step: BookingStep
  selectedEventType: EventType | null
  selectedDate: Date
  selectedSlot: AvailableSlot | null
  guestInfo: Guest | null
}

export interface BookingStats {
  today: number
  thisWeek: number
  thisMonth: number
  totalDurationToday: number // in minutes
}

export interface DateRangeFilter {
  dateFrom: string
  dateTo: string
}

// Re-export API types for convenience
export type { EventType, Guest, AvailableSlot }
