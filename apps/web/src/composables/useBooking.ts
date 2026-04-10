import { ref, computed } from 'vue';
import type { EventType, AvailableSlot, PublicOwner, Booking, CreateBookingRequest } from '../types/booking';
import {
  formatTimeRange,
  addMonths
} from '../utils/date.utils';

const API_BASE_URL = '/api';

export function useEventTypes() {
  const eventTypes = ref<EventType[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchEventTypes = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/event-types`);
      if (!response.ok) {
        throw new Error('Failed to fetch event types');
      }
      const data = await response.json();
      eventTypes.value = data.eventTypes;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    eventTypes,
    isLoading,
    error,
    fetchEventTypes
  };
}

export function useAvailableSlots() {
  const slots = ref<AvailableSlot[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchSlots = async (eventTypeId: string, dateFrom: string, dateTo: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      params.append('dateFrom', dateFrom);
      params.append('dateTo', dateTo);
      const response = await fetch(
        `${API_BASE_URL}/event-types/${eventTypeId}/available-slots?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      const data = await response.json();
      slots.value = data.slots;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    slots,
    isLoading,
    error,
    fetchSlots
  };
}

export function useOwner() {
  const owner = ref<PublicOwner | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchOwner = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/owner`);
      if (!response.ok) {
        throw new Error('Failed to fetch owner');
      }
      const data = await response.json();
      owner.value = data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  };

  const maxBookingDate = computed(() => {
    if (!owner.value) return null;
    const months = owner.value.bookingMonthsAhead ?? 3;
    return addMonths(new Date(), months);
  });

  return {
    owner,
    isLoading,
    error,
    fetchOwner,
    maxBookingDate
  };
}

export function useCreateBooking() {
  const booking = ref<Booking | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const createBooking = async (request: CreateBookingRequest) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      const data = await response.json();
      booking.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    booking,
    isLoading,
    error,
    createBooking
  };
}

// Re-export for backward compatibility
export { toUTCDateString, toUTCEndOfDayString } from '../utils/date.utils';
export { formatLongDate as formatDate } from '../utils/date.utils';
export { addMonths, startOfLocalMonth, endOfLocalMonth } from '../utils/date.utils';

/**
 * Formats an available slot as time range for display.
 * Uses local timezone for display.
 */
export function formatSlotTime(slot: AvailableSlot): string {
  return formatTimeRange(slot.startTime, slot.endTime);
}
