/**
 * Public API client (no authentication required)
 */

import { createApiClient } from './client'
import type { DateRangeParams } from './common'
import type {
  EventType,
  PublicOwner,
  WorkingHours,
  AvailableSlotsResponse,
  Booking,
  CreateBookingRequest
} from './types'

const publicClient = createApiClient('')

export const publicApi = {
  // Event Types
  async listEventTypes(): Promise<EventType[]> {
    const response = await publicClient.get<{ eventTypes: EventType[] }>('/event-types')
    return response.eventTypes
  },

  async getEventType(id: string): Promise<EventType> {
    return publicClient.get<EventType>(`/event-types/${id}`)
  },

  // Available Slots
  async getAvailableSlots(
    eventTypeId: string,
    dateRange: DateRangeParams
  ): Promise<AvailableSlotsResponse> {
    return publicClient.get<AvailableSlotsResponse>(`/event-types/${eventTypeId}/available-slots`, {
      params: { dateFrom: dateRange.dateFrom, dateTo: dateRange.dateTo }
    })
  },

  // Owner Profile
  async getOwner(): Promise<PublicOwner> {
    return publicClient.get<PublicOwner>('/owner')
  },

  // Working Hours
  async getWorkingHours(): Promise<WorkingHours[]> {
    const response = await publicClient.get<{ workingHours: WorkingHours[] }>('/owner/working-hours')
    return response.workingHours
  },

  // Bookings
  async createBooking(request: CreateBookingRequest): Promise<Booking> {
    return publicClient.post<Booking>('/bookings', request)
  }
}
