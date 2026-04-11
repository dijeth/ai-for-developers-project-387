import { ref, computed } from 'vue';
import type { Booking, Owner, WorkingHours, WorkingHoursTimeOff, EventType, BookingStats, DateRangeFilter } from '../types/admin';
import { fromISO } from '@calendar/date-utils';
import {
  isSameLocalDay,
  startOfLocalWeek,
  endOfLocalWeek,
  startOfLocalMonth,
  endOfLocalMonth,
  getLocalDayOfWeek,
  addMonths
} from '../utils/date.utils';

const ADMIN_API_BASE_URL = '/api/admin';

export function useAdminBookings() {
  const bookings = ref<Booking[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchBookings = async (filter?: DateRangeFilter) => {
    isLoading.value = true;
    error.value = null;
    try {
      let url = `${ADMIN_API_BASE_URL}/bookings`;
      if (filter) {
        const params = new URLSearchParams();
        params.append('dateFrom', filter.dateFrom);
        params.append('dateTo', filter.dateTo);
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      bookings.value = data.bookings;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      // Mock implementation - log to console as requested
      console.log(`[MOCK] Deleting booking ${id}`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove from local list
      bookings.value = bookings.value.filter(b => b.id !== id);
      return true;
    } catch (e) {
      console.error('Failed to delete booking:', e);
      throw e;
    }
  };

  return {
    bookings,
    isLoading,
    error,
    fetchBookings,
    deleteBooking
  };
}

export function useAdminOwner() {
  const owner = ref<Owner | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchOwner = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/owner`);
      if (!response.ok) {
        throw new Error(`Failed to fetch owner: ${response.status}`);
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

  const updateOwner = async (updates: Partial<Owner>) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/owner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        throw new Error('Failed to update owner');
      }
      const data = await response.json();
      owner.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    owner,
    isLoading,
    error,
    fetchOwner,
    updateOwner,
    maxBookingDate
  };
}

export function useAdminTimeOffs() {
  const timeOffs = ref<WorkingHoursTimeOff[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const getApiErrorMessage = async (
    response: Response,
    fallback: string
  ): Promise<string> => {
    try {
      const data = await response.json();
      if (typeof data?.message === 'string') {
        return data.message;
      }
      if (Array.isArray(data?.message)) {
        return data.message.join(', ');
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  const fetchTimeOffs = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/owner/time-offs`);
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to fetch time-offs'));
      }
      const data = await response.json();
      timeOffs.value = Array.isArray(data) ? data : data.timeOffs;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const createTimeOff = async (payload: {
    startDateTime: string;
    endDateTime: string;
  }) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/owner/time-offs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to create time-off'));
      }

      const data = await response.json();
      timeOffs.value = [...timeOffs.value, data];
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const updateTimeOff = async (
    id: string,
    payload: {
      startDateTime?: string;
      endDateTime?: string;
    }
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/owner/time-offs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to update time-off'));
      }

      const data = await response.json();
      timeOffs.value = timeOffs.value.map((item) =>
        item.id === id ? data : item
      );
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTimeOff = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/owner/time-offs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to delete time-off'));
      }

      timeOffs.value = timeOffs.value.filter((item) => item.id !== id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    timeOffs,
    isLoading,
    error,
    fetchTimeOffs,
    createTimeOff,
    updateTimeOff,
    deleteTimeOff
  };
}

export function useAdminEventTypes() {
  const eventTypes = ref<EventType[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const getApiErrorMessage = async (
    response: Response,
    fallback: string
  ): Promise<string> => {
    try {
      const data = await response.json();
      if (typeof data?.message === 'string') {
        return data.message;
      }
      if (Array.isArray(data?.message)) {
        return data.message.join(', ');
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  const fetchEventTypes = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/event-types`);
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to fetch event types'));
      }
      const data = await response.json();
      eventTypes.value = Array.isArray(data) ? data : data.eventTypes;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const createEventType = async (payload: {
    title: string;
    durationMinutes: number;
  }) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/event-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to create event type'));
      }

      const data = await response.json();
      eventTypes.value = [...eventTypes.value, data];
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const updateEventType = async (
    id: string,
    payload: {
      title?: string;
      durationMinutes?: number;
    }
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/event-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to update event type'));
      }

      const data = await response.json();
      eventTypes.value = eventTypes.value.map((item) =>
        item.id === id ? data : item
      );
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteEventType = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/event-types/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to delete event type'));
      }

      eventTypes.value = eventTypes.value.filter((item) => item.id !== id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    eventTypes,
    isLoading,
    error,
    fetchEventTypes,
    createEventType,
    updateEventType,
    deleteEventType
  };
}

export function useAdminWorkingHours() {
  const workingHours = ref<WorkingHours[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchWorkingHours = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/owner/working-hours`);
      if (!response.ok) {
        throw new Error(`Failed to fetch working hours: ${response.status}`);
      }
      const data = await response.json();
      workingHours.value = data.workingHours;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  };

  const workingDays = computed(() => workingHours.value.map((wh) => wh.weekday));

  const updateWorkingHours = async (weekday: string, updates: { startTime?: string; endTime?: string }) => {
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/owner/working-hours/${weekday}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        throw new Error(`Failed to update working hours for ${weekday}`);
      }
      const data = await response.json();
      // Update local state
      const index = workingHours.value.findIndex((wh) => wh.weekday === weekday);
      if (index >= 0) {
        workingHours.value[index] = data.workingHours;
      }
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    }
  };

  const replaceWorkingHours = async (entries: { weekday: string; startTime: string; endTime: string }[]) => {
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/owner/working-hours`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workingHours: entries })
      });
      if (!response.ok) {
        throw new Error('Failed to save working hours');
      }
      const data = await response.json();
      workingHours.value = data.workingHours;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    }
  };

  return {
    workingHours,
    workingDays,
    isLoading,
    error,
    fetchWorkingHours,
    updateWorkingHours,
    replaceWorkingHours
  };
}

export function useBookingStats() {
  const calculateStats = (bookings: Booking[]): BookingStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = startOfLocalWeek(today);
    const weekEnd = endOfLocalWeek(weekStart);
    const monthStart = startOfLocalMonth(now);
    const monthEnd = endOfLocalMonth(now);

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    let todayDuration = 0;

    bookings.forEach(booking => {
      const bookingDate = fromISO(booking.startTime);
      const duration = booking.eventType.durationMinutes;

      if (isSameLocalDay(bookingDate, today)) {
        todayCount++;
        todayDuration += duration;
      }

      if (bookingDate >= weekStart && bookingDate <= weekEnd) {
        weekCount++;
      }

      if (bookingDate >= monthStart && bookingDate <= monthEnd) {
        monthCount++;
      }
    });

    return {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      totalDurationToday: todayDuration
    };
  };

  return {
    calculateStats
  };
}

// Re-export date utilities for backward compatibility
export {
  toUTCDateString,
  toUTCEndOfDayString,
  formatLocalDate as formatDateLocal,
  formatLocalTime as formatTimeLocal,
  formatLocalDateTime as formatDateTimeLocal,
  fromISO,
  isSameLocalDay as isSameDay,
  getLocalDayOfWeek
} from '../utils/date.utils';

/**
 * Gets day of week string from a date.
 */
export function getDayOfWeek(date: Date): 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' {
  const days: ('sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat')[] =
    ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[getLocalDayOfWeek(date)] as 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
}
