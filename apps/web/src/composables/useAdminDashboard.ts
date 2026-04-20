import { ref, computed } from 'vue';
import type { Booking, Owner, WorkingHours, WorkingHoursTimeOff, EventType, BookingStats, DateRangeFilter } from '../types/admin';
import { fromISO } from '@calendar/date-utils';
import { adminApi } from '../api';
import {
  isSameLocalDay,
  startOfLocalWeek,
  endOfLocalWeek,
  startOfLocalMonth,
  endOfLocalMonth,
  addMonths
} from '../utils/date.utils';

export function useAdminBookings() {
  const bookings = ref<Booking[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchBookings = async (filter?: DateRangeFilter) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await adminApi.listBookings(filter);
      bookings.value = data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  };

  const deleteBooking = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await adminApi.deleteBooking(id);
      // Remove from local list
      bookings.value = bookings.value.filter(b => b.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      isLoading.value = false;
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
      const data = await adminApi.getOwner();
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
      const data = await adminApi.updateOwner(updates);
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

  const fetchTimeOffs = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await adminApi.listTimeOffs();
      timeOffs.value = data;
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
      const data = await adminApi.createTimeOff(payload);
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
      const data = await adminApi.updateTimeOff(id, payload);
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
      await adminApi.deleteTimeOff(id);
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

  const fetchEventTypes = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await adminApi.listEventTypes();
      eventTypes.value = data;
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
    description?: string;
  }) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await adminApi.createEventType(payload);
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
      description?: string;
    }
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await adminApi.updateEventType(id, payload);
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
      await adminApi.deleteEventType(id);
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
      const data = await adminApi.getWorkingHours();
      workingHours.value = data;
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
      const data = await adminApi.updateWorkingHours(weekday, updates);
      // Update local state
      const index = workingHours.value.findIndex((wh) => wh.weekday === weekday);
      if (index >= 0) {
        workingHours.value[index] = data;
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
      const data = await adminApi.replaceWorkingHours(entries);
      workingHours.value = data;
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
  fromISO,
  isSameLocalDay as isSameDay
} from '../utils/date.utils';
