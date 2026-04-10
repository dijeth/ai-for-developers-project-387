import { ref, computed } from 'vue';
import type { Booking, Owner, WorkingHoursTimeOff, BookingStats, DateRangeFilter } from '../types/admin';
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

export function useAdminTimeOffs() {
  const timeOffs = ref<WorkingHoursTimeOff[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchTimeOffs = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/owner/time-offs`);
      if (!response.ok) {
        throw new Error('Failed to fetch time-offs');
      }
      const data = await response.json();
      timeOffs.value = data.timeOffs;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    timeOffs,
    isLoading,
    error,
    fetchTimeOffs
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
