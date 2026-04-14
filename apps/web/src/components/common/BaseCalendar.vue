<script setup lang="ts">
import { computed, ref } from "vue";
import Calendar from "primevue/calendar";

interface Props {
  modelValue: Date;
  minDate?: Date;
  maxDate?: Date | null;
  workingDays?: string[];
  markedDates?: Set<string>;
  showLegend?: boolean;
  disabledTooltip?: string;
  markerType?: "primary" | "success";
  legendLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  minDate: () => new Date(),
  maxDate: null,
  workingDays: () => ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  markedDates: () => new Set<string>(),
  showLegend: false,
  disabledTooltip: "Выходной день",
  markerType: "primary",
  legendLabel: "Есть бронирования",
});

const emit = defineEmits<{
  "update:modelValue": [date: Date];
  "month-change": [date: Date];
}>();

// Day of week mapping (0=Sunday, 1=Monday, etc.)
const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Computed selected date for v-model
const selectedDate = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (value) {
      emit("update:modelValue", value);
    }
  },
});

// Check if a specific date is a working day
const isWorkingDay = (year: number, month: number, day: number): boolean => {
  // month is 0-based in JavaScript Date
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  return props.workingDays.includes(dayMap[dayOfWeek]);
};

// Check if a specific date has a marker (booking/slot indicator)
const hasMarker = (year: number, month: number, day: number): boolean => {
  // Create date key in YYYY-MM-DD format
  const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return props.markedDates.has(key);
};

// Track previous date to detect month changes via modelValue
const previousDate = ref<Date | null>(new Date(props.modelValue));

// Handle model value update to detect month changes
const handleModelValueUpdate = (
  value: Date | Date[] | (Date | null)[] | null | undefined,
) => {
  const date = Array.isArray(value) ? value[0] : value;
  if (!date || !previousDate.value) {
    if (date) previousDate.value = new Date(date);
    return;
  }

  const prevMonth = previousDate.value.getMonth();
  const prevYear = previousDate.value.getFullYear();
  const newMonth = date.getMonth();
  const newYear = date.getFullYear();

  if (newMonth !== prevMonth || newYear !== prevYear) {
    emit("month-change", new Date(newYear, newMonth, 1));
  }
  previousDate.value = new Date(date);
};

// Handle month change event
const handleMonthChange = (event: { month: number; year: number }) => {
  const newDate = new Date(event.year, event.month - 1, 1);
  emit("month-change", newDate);
};

// Handle date selection
const handleDateSelect = (date: Date) => {
  emit("update:modelValue", date);
};

// Computed max date for calendar
const calendarMaxDate = computed(() => {
  return props.maxDate || undefined;
});

// Key to force re-render of date slots when markedDates changes
const markedDatesKey = computed(() => {
  return Array.from(props.markedDates).sort().join(",");
});
</script>

<template>
  <div class="base-calendar-container">
    <Calendar
      v-model="selectedDate"
      inline
      showOtherMonths
      :min-date="minDate"
      :max-date="calendarMaxDate"
      @date-select="handleDateSelect"
      @month-change="handleMonthChange"
      @update:modelValue="handleModelValueUpdate"
      class="base-calendar"
    >
      <template #date="{ date }">
        <span
          :key="`${date.year}-${date.month}-${date.day}-${markedDatesKey}`"
          class="calendar-date"
          :class="{
            'has-marker': hasMarker(date.year, date.month, date.day),
            'marker-type-primary':
              hasMarker(date.year, date.month, date.day) &&
              markerType === 'primary',
            'marker-type-success':
              hasMarker(date.year, date.month, date.day) &&
              markerType === 'success',
            'is-working-day': isWorkingDay(date.year, date.month, date.day),
            'is-non-working-day': !isWorkingDay(
              date.year,
              date.month,
              date.day,
            ),
          }"
          :title="
            !isWorkingDay(date.year, date.month, date.day)
              ? disabledTooltip
              : undefined
          "
        >
          {{ date.day }}
          <span
            v-if="hasMarker(date.year, date.month, date.day)"
            class="marker-indicator"
          ></span>
        </span>
      </template>
    </Calendar>

    <!-- Legend -->
    <div v-if="showLegend" class="calendar-legend">
      <div class="legend-item">
        <span
          class="legend-dot"
          :class="{
            'has-markers-primary': markerType === 'primary',
            'has-markers-success': markerType === 'success',
          }"
        ></span>
        <span class="legend-label">{{ legendLabel }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot disabled"></span>
        <span class="legend-label">Недоступно</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-calendar-container {
  width: 100%;
}

.base-calendar {
  width: 100%;
}

.base-calendar :deep(.p-calendar) {
  width: 100%;
}

.base-calendar :deep(.p-datepicker) {
  border: none;
  background: transparent;
  width: 100%;
}

.base-calendar :deep(.p-datepicker-header) {
  background: transparent;
  border: none;
  padding: 0 0 1rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.base-calendar :deep(.p-datepicker-title) {
  font-weight: 600;
  font-size: 1rem;
  color: var(--surface-900);
}

.base-calendar :deep(.p-datepicker-calendar) {
  width: 100%;
}

.base-calendar :deep(.p-datepicker-calendar th) {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--surface-500);
  text-transform: uppercase;
  padding: 0.5rem;
}

.base-calendar :deep(.p-datepicker-calendar td) {
  padding: 0.125rem;
}

.base-calendar :deep(.p-datepicker-calendar td > span) {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  position: relative;
}

.base-calendar
  :deep(.p-datepicker-calendar td:not(:has(.is-non-working-day)) > span:hover) {
  background: var(--surface-100);
}

.base-calendar :deep(.p-datepicker-calendar td.p-highlight > span) {
  background: var(--primary-color);
  color: white;
  font-weight: 600;
}

/* Disabled days (weekends/non-working days) styling */
.base-calendar :deep(.p-datepicker-calendar td.p-disabled > span) {
  color: var(--surface-300);
  cursor: not-allowed;
  background: transparent;
}

/* Custom calendar date styling */
.base-calendar :deep(.p-datepicker-calendar td > span) {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0;
}

.calendar-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Marker indicator dot */
.marker-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-color);
  margin-top: 2px;
}

/* Non-working days - disabled */
.base-calendar
  :deep(.p-datepicker-calendar td:has(.is-non-working-day) > span) {
  color: var(--surface-300);
  cursor: not-allowed;
  pointer-events: none;
  background: transparent;
}

/* Day with marker - highlighted background */
.base-calendar
  :deep(
    .p-datepicker-calendar td:has(.has-marker):has(.is-working-day) > span
  ) {
  background: var(--primary-100);
  color: var(--primary-700);
  font-weight: 600;
}

/* Selected day with marker - only for working days */
.base-calendar
  :deep(
    .p-datepicker-calendar
      td.p-highlight:has(.has-marker):has(.is-working-day)
      > span
  ) {
  background: var(--primary-color);
  color: white;
}

.base-calendar
  :deep(
    .p-datepicker-calendar
      td.p-highlight:has(.has-marker):has(.is-working-day)
      .marker-indicator
  ) {
  background: white;
}

/* Success marker type (for available slots) - green */
.base-calendar
  :deep(
    .p-datepicker-calendar
      td:has(.marker-type-success):has(.is-working-day)
      > span
  ) {
  background: var(--green-100);
  color: var(--green-700);
  font-weight: 600;
}

.base-calendar
  :deep(.p-datepicker-calendar td:has(.marker-type-success) .marker-indicator) {
  background: var(--green-500);
}

/* Selected day with success marker */
.base-calendar
  :deep(
    .p-datepicker-calendar
      td.p-highlight:has(.marker-type-success):has(.is-working-day)
      > span
  ) {
  background: var(--green-500);
  color: white;
}

.base-calendar
  :deep(
    .p-datepicker-calendar
      td.p-highlight:has(.marker-type-success):has(.is-working-day)
      .marker-indicator
  ) {
  background: white;
}

/* Legend */
.calendar-legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.legend-dot.has-markers-primary {
  background: var(--primary-100);
  border: 2px solid var(--primary-500);
}

.legend-dot.has-markers-success {
  background: var(--green-100);
  border: 2px solid var(--green-500);
}

.legend-dot.disabled {
  background: var(--surface-200);
}

.legend-label {
  font-size: 0.875rem;
  color: var(--surface-600);
}

@media (max-width: 768px) {
  .calendar-legend {
    flex-direction: column;
    gap: 0.5rem;
  }

  .base-calendar :deep(.p-datepicker-calendar td > span) {
    width: 2.25rem;
    height: 2.25rem;
  }
}
</style>
