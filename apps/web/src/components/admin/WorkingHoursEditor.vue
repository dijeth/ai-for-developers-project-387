<script setup lang="ts">
import { ref, watch } from "vue";
import Checkbox from "primevue/checkbox";
import Slider from "primevue/slider";
import Button from "primevue/button";
import Message from "primevue/message";
import type { WorkingHours, DayOfWeek } from "../../types/admin";

interface Props {
  workingHours: WorkingHours[];
  isLoading?: boolean;
}

interface Emits {
  (
    e: "save",
    data: { weekday: DayOfWeek; startTime: string; endTime: string }[],
  ): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dayLabels: Record<DayOfWeek, string> = {
  mon: "Понедельник",
  tue: "Вторник",
  wed: "Среда",
  thu: "Четверг",
  fri: "Пятница",
  sat: "Суббота",
  sun: "Воскресенье",
};

const daysOfWeek: DayOfWeek[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

interface DaySchedule {
  weekday: DayOfWeek;
  isEnabled: boolean;
  startHour: number;
  endHour: number;
}

const daySchedules = ref<Map<DayOfWeek, DaySchedule>>(new Map());
const error = ref<string | null>(null);
const isSubmitting = ref(false);

// Initialize schedules from props
watch(
  () => props.workingHours,
  (newHours) => {
    const scheduleMap = new Map<DayOfWeek, DaySchedule>();

    // Initialize all days first (disabled by default)
    daysOfWeek.forEach((day) => {
      scheduleMap.set(day, {
        weekday: day,
        isEnabled: false,
        startHour: 9,
        endHour: 17,
      });
    });

    // Override with existing working hours
    newHours.forEach((wh: WorkingHours) => {
      const startHour =
        parseInt(wh.startTime.split(":")[0]) +
        parseInt(wh.startTime.split(":")[1]) / 60;
      const endHour =
        parseInt(wh.endTime.split(":")[0]) +
        parseInt(wh.endTime.split(":")[1]) / 60;

      scheduleMap.set(wh.weekday, {
        weekday: wh.weekday,
        isEnabled: true,
        startHour,
        endHour,
      });
    });

    daySchedules.value = scheduleMap;
  },
  { immediate: true, deep: true },
);

const timeToString = (hour: number): string => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const getScheduleDisplay = (schedule: DaySchedule): string => {
  if (!schedule.isEnabled) {
    return "Выходной";
  }
  return `${timeToString(schedule.startHour)} - ${timeToString(schedule.endHour)}`;
};

const handleSliderChange = (day: DayOfWeek, values: number[]) => {
  const schedule = daySchedules.value.get(day);
  if (schedule && Array.isArray(values) && values.length === 2) {
    schedule.startHour = values[0];
    schedule.endHour = values[1];
  }
};

const handleDayToggle = (day: DayOfWeek) => {
  const schedule = daySchedules.value.get(day);
  if (schedule) {
    schedule.isEnabled = !schedule.isEnabled;
  }
};

const handleSave = async () => {
  error.value = null;
  isSubmitting.value = true;

  try {
    const updates: {
      weekday: DayOfWeek;
      startTime: string;
      endTime: string;
    }[] = [];

    daySchedules.value.forEach((schedule) => {
      if (schedule.isEnabled) {
        updates.push({
          weekday: schedule.weekday,
          startTime: timeToString(schedule.startHour),
          endTime: timeToString(schedule.endHour),
        });
      }
    });

    emit("save", updates);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Unknown error";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="working-hours-editor">
    <h2 class="editor-title">Рабочие часы</h2>

    <Message
      v-if="error"
      severity="error"
      :text="error"
      class="error-message"
    />

    <div class="editor-container">
      <!-- Days of week list -->
      <div class="days-list">
        <div v-for="day in daysOfWeek" :key="day" class="day-item">
          <div class="day-header">
            <Checkbox
              :model-value="daySchedules.get(day)?.isEnabled || false"
              @update:model-value="handleDayToggle(day)"
              :disabled="isLoading || isSubmitting"
              :input-id="`enable-day-${day}`"
              binary
            />
            <label :for="`enable-day-${day}`" class="day-label">
              {{ dayLabels[day] }}
            </label>
            <span class="schedule-display">
              {{ getScheduleDisplay(daySchedules.get(day)!) }}
            </span>
          </div>

          <!-- Time slider -->
          <div class="slider-container">
            <Slider
              :model-value="[
                daySchedules.get(day)?.startHour || 0,
                daySchedules.get(day)?.endHour || 24,
              ]"
              @update:model-value="
                (values: any) => handleSliderChange(day, values)
              "
              :min="0"
              :max="24"
              :step="0.5"
              range
              :disabled="
                isLoading || isSubmitting || !daySchedules.get(day)?.isEnabled
              "
            />
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <Button
        type="button"
        label="Сохранить рабочие часы"
        icon="pi pi-save"
        :loading="isSubmitting || isLoading"
        @click="handleSave"
        class="save-button"
      />
    </div>
  </div>
</template>

<style scoped>
.working-hours-editor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.error-message {
  margin-bottom: 1rem;
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.days-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.day-item {
  border: 1px solid var(--surface-border);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: background-color 0.2s ease;
}

.day-item:hover {
  background-color: var(--surface-50);
}

.day-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.day-label {
  flex: 1;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
}

.schedule-display {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  min-width: 8rem;
  text-align: right;
  white-space: nowrap;
}

.slider-container {
  margin-left: 2rem;
  margin-right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Disabled slider styling */
.slider-container :deep(.p-slider.p-disabled) {
  opacity: 0.6;
}

.save-button {
  width: 100%;
  margin-top: 1rem;
}
</style>
