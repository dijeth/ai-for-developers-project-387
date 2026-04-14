/**
 * API types - unified export of generated OpenAPI types and UI-specific types
 */

import type { components } from '../types/generated/api-types'

// Re-export generated components
type Schemas = components['schemas']

// Schema types with simpler names
export type EventType = Schemas['EventType']
export type Booking = Schemas['Booking']
export type Guest = Schemas['Guest']
export type PublicOwner = Schemas['PublicOwner']
export type WorkingHours = Schemas['WorkingHours']
export type Owner = Schemas['Owner']
export type WorkingHoursTimeOff = Schemas['WorkingHoursTimeOff']
export type CreateBookingRequest = Schemas['CreateBookingRequest']
export type CreateTimeOffRequest = Schemas['CreateTimeOffRequest']
export type UpdateTimeOffRequest = Schemas['UpdateTimeOffRequest']
export type CreateEventTypeRequest = Schemas['CreateEventTypeRequest']
export type AvailableSlot = Schemas['AvailableSlot']
export type AvailableSlotsResponse = Schemas['AvailableSlotsResponse']
export type BookingListResponse = Schemas['BookingListResponse']
export type ErrorResponse = Schemas['ErrorResponse']

// API response types from operations
export type ListTimeOffsResponse = WorkingHoursTimeOff[]
export type ListWorkingHoursResponse = { workingHours: WorkingHours[] }
