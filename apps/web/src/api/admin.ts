/**
 * Admin API client (requires authentication in future)
 */

import { createApiClient } from './client'
import type { DateRangeParams } from './common'
import type {
  Booking,
  BookingListResponse,
  EventType,
  Owner,
  WorkingHours,
  WorkingHoursTimeOff,
  CreateTimeOffRequest,
  UpdateTimeOffRequest,
  CreateEventTypeRequest
} from './types'

const adminClient = createApiClient('/admin')

export const adminApi = {
  // Bookings
  async listBookings(filter?: DateRangeParams): Promise<Booking[]> {
    const options = filter ? { params: { dateFrom: filter.dateFrom, dateTo: filter.dateTo } } : undefined
    const response = await adminClient.get<BookingListResponse>('/bookings', options)
    return response.bookings
  },

  async deleteBooking(id: string): Promise<void> {
    return adminClient.delete<void>(`/bookings/${id}`)
  },

  // Event Types
  async listEventTypes(): Promise<EventType[]> {
    const response = await adminClient.get<{ eventTypes: EventType[] }>('/event-types')
    return response.eventTypes
  },

  async createEventType(request: CreateEventTypeRequest): Promise<EventType> {
    return adminClient.post<EventType>('/event-types', request)
  },

  async updateEventType(id: string, request: Partial<CreateEventTypeRequest>): Promise<EventType> {
    return adminClient.put<EventType>(`/event-types/${id}`, request)
  },

  async deleteEventType(id: string): Promise<void> {
    return adminClient.delete<void>(`/event-types/${id}`)
  },

  // Owner Profile
  async getOwner(): Promise<Owner> {
    return adminClient.get<Owner>('/owner')
  },

  async updateOwner(updates: Partial<Owner>): Promise<Owner> {
    return adminClient.put<Owner>('/owner', updates)
  },

  // Working Hours
  async getWorkingHours(): Promise<WorkingHours[]> {
    const response = await adminClient.get<{ workingHours: WorkingHours[] }>('/owner/working-hours')
    return response.workingHours
  },

  async updateWorkingHours(
    weekday: string,
    updates: { startTime?: string; endTime?: string }
  ): Promise<WorkingHours> {
    const response = await adminClient.put<{ workingHours: WorkingHours }>(`/owner/working-hours/${weekday}`, updates)
    return response.workingHours
  },

  async replaceWorkingHours(
    entries: { weekday: string; startTime: string; endTime: string }[]
  ): Promise<WorkingHours[]> {
    const response = await adminClient.put<{ workingHours: WorkingHours[] }>('/owner/working-hours', {
      workingHours: entries
    })
    return response.workingHours
  },

  // Time Offs
  async listTimeOffs(): Promise<WorkingHoursTimeOff[]> {
    return adminClient.get<WorkingHoursTimeOff[]>('/owner/time-offs')
  },

  async createTimeOff(request: CreateTimeOffRequest): Promise<WorkingHoursTimeOff> {
    return adminClient.post<WorkingHoursTimeOff>('/owner/time-offs', request)
  },

  async updateTimeOff(id: string, request: UpdateTimeOffRequest): Promise<WorkingHoursTimeOff> {
    return adminClient.put<WorkingHoursTimeOff>(`/owner/time-offs/${id}`, request)
  },

  async deleteTimeOff(id: string): Promise<void> {
    return adminClient.delete<void>(`/owner/time-offs/${id}`)
  }
}
