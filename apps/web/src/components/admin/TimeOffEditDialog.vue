<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputMask from "primevue/inputmask";
import Message from "primevue/message";
import type { WorkingHoursTimeOff } from "../../types/admin";
import BaseCalendar from "../common/BaseCalendar.vue";

interface TimeOffPayload {
  startDateTime: string;
  endDateTime: string;
}

interface Props {
  visible: boolean;
  timeOff?: WorkingHoursTimeOff | null;
  isLoading?: boolean;
  workingDays?: string[];
  markedDates?: Set<string>;
  maxDate?: Date | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:visible": [visible: boolean];
  save: [payload: TimeOffPayload];
}>();

const selectedDate = ref(new Date());
const startTime = ref("");
const endTime = ref("");
const validationError = ref<string | null>(null);

const isEditMode = computed(() => Boolean(props.timeOff));

const isTimeValueValid = (time: string): boolean => {
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return false;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

const convertLocalDateAndTimeToUtcIso = (date: Date, time: string): string => {
  const [hoursString, minutesString] = time.split(":");
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const localDateTime = new Date(
    year,
    month,
    day,
    Number(hoursString),
    Number(minutesString),
    0,
    0,
  );

  return localDateTime.toISOString();
};

const resetForm = () => {
  selectedDate.value = new Date();
  startTime.value = "";
  endTime.value = "";
  validationError.value = null;
};

const fillFormFromTimeOff = (timeOff: WorkingHoursTimeOff) => {
  const startDate = new Date(timeOff.startDateTime);
  const endDate = new Date(timeOff.endDateTime);

  selectedDate.value = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );

  startTime.value = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;
  endTime.value = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
};

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetForm();
      return;
    }

    if (props.timeOff) {
      fillFormFromTimeOff(props.timeOff);
      return;
    }

    resetForm();
  },
);

const handleCancel = () => {
  emit("update:visible", false);
};

const handleSave = () => {
  validationError.value = null;

  if (!startTime.value || !endTime.value) {
    validationError.value = "Укажите время начала и окончания";
    return;
  }

  if (!isTimeValueValid(startTime.value) || !isTimeValueValid(endTime.value)) {
    validationError.value = "Введите корректное время в формате HH:mm";
    return;
  }

  const startDateTime = convertLocalDateAndTimeToUtcIso(
    selectedDate.value,
    startTime.value,
  );
  const endDateTime = convertLocalDateAndTimeToUtcIso(
    selectedDate.value,
    endTime.value,
  );

  if (new Date(endDateTime).getTime() <= new Date(startDateTime).getTime()) {
    validationError.value = "Время окончания должно быть позже времени начала";
    return;
  }

  emit("save", { startDateTime, endDateTime });
};
</script>

<template>
  <Dialog
    :visible="visible"
    :header="isEditMode ? 'Редактировать time-off' : 'Добавить time-off'"
    modal
    class="time-off-dialog"
    :closable="!isLoading"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="dialog-content">
      <Message
        v-if="validationError"
        severity="error"
        :text="validationError"
      />

      <div class="field-group">
        <label class="field-label" for="time-off-date">День</label>
        <BaseCalendar
          v-model="selectedDate"
          :working-days="workingDays"
          :marked-dates="markedDates"
          :max-date="maxDate"
          :show-legend="true"
          legend-label="Есть бронирования"
        />
      </div>

      <div class="time-grid">
        <div class="field-group">
          <label class="field-label" for="time-off-start">Время начала</label>
          <InputMask
            id="time-off-start"
            v-model="startTime"
            mask="99:99"
            slotChar="hh:mm"
            :disabled="isLoading"
            placeholder="HH:mm"
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="time-off-end">Время окончания</label>
          <InputMask
            id="time-off-end"
            v-model="endTime"
            mask="99:99"
            slotChar="hh:mm"
            :disabled="isLoading"
            placeholder="HH:mm"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Отмена"
        severity="secondary"
        text
        :disabled="isLoading"
        @click="handleCancel"
      />
      <Button
        :label="isEditMode ? 'Сохранить' : 'Создать'"
        :loading="isLoading"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 320px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-group :deep(.base-calendar-container) {
  margin-top: 0.25rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
}

.time-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .dialog-content {
    min-width: auto;
  }

  .time-grid {
    grid-template-columns: 1fr;
  }
}
</style>
