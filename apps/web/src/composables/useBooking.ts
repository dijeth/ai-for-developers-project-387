import { ref, computed } from 'vue';
import type { EventType, AvailableSlot, PublicOwner, WorkingHours, Booking, CreateBookingRequest } from '../types/booking';
import { publicApi } from '../api';
import {
  formatTimeRange,
  addMonths
} from '../utils/date.utils';

export function useEventTypes() {
  const eventTypes = ref<EventType[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchEventTypes = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await publicApi.listEventTypes();
      eventTypes.value = data;
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
      const data = await publicApi.getAvailableSlots(eventTypeId, { dateFrom, dateTo });
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
      const data = await publicApi.getOwner();
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

export function useWorkingHours() {
  const workingHours = ref<WorkingHours[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchWorkingHours = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await publicApi.getWorkingHours();
      workingHours.value = data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  };

  const workingDays = computed(() => workingHours.value.map((wh) => wh.weekday));

  return {
    workingHours,
    workingDays,
    isLoading,
    error,
    fetchWorkingHours
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
      const data = await publicApi.createBooking(request);
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
export { addMonths } from '../utils/date.utils';

/**
 * Formats an available slot as time range for display.
 * Uses local timezone for display.
 */
export function formatSlotTime(slot: AvailableSlot): string {
  return formatTimeRange(slot.startTime, slot.endTime);
}
