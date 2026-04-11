<script setup lang="ts">
import type { AvailableSlot } from "../../types/booking";
import Button from "primevue/button";
import { formatSlotTime } from "../../composables/useBooking";

interface Props {
  slots: AvailableSlot[];
  selectedSlot: AvailableSlot | null;
  isLoading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  select: [slot: AvailableSlot];
  back: [];
  continue: [];
}>();

const handleSlotClick = (slot: AvailableSlot) => {
  emit("select", slot);
};

const handleBack = () => {
  emit("back");
};

const handleContinue = () => {
  emit("continue");
};
</script>

<template>
  <div class="time-slots-panel">
    <h3 class="panel-title">Статус слотов</h3>

    <div v-if="isLoading" class="loading-state">
      <span class="loading-text">Загрузка слотов...</span>
    </div>

    <div v-else-if="slots.length === 0" class="empty-state">
      <span class="empty-text">Нет доступных слотов</span>
    </div>

    <div v-else class="slots-list">
      <div
        v-for="slot in slots"
        :key="slot.startTime"
        class="slot-item"
        :class="{ selected: selectedSlot?.startTime === slot.startTime }"
        @click="handleSlotClick(slot)"
      >
        <span class="slot-time">{{ formatSlotTime(slot) }}</span>
        <span class="slot-status free">Свободно</span>
      </div>
    </div>

    <div class="action-buttons">
      <Button
        label="Продолжить"
        class="continue-btn"
        :disabled="!selectedSlot"
        @click="handleContinue"
      />
      <Button
        label="Изменить тип события"
        class="p-button-outlined back-btn"
        @click="handleBack"
      />
    </div>
  </div>
</template>

<style scoped>
.time-slots-panel {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--surface-900);
}

.loading-state,
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-text,
.empty-text {
  font-size: 0.875rem;
  color: var(--surface-500);
}

.slots-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-height: 400px;
}

.slot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background: var(--surface-50);
  border: 1px solid var(--surface-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slot-item:hover {
  border-color: var(--primary-color);
  background: var(--surface-100);
}

.slot-item.selected {
  border-color: var(--primary-color);
  background: var(--primary-color);
}

.slot-item.selected .slot-time,
.slot-item.selected .slot-status {
  color: white;
}

.slot-time {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--surface-900);
}

.slot-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.slot-status.free {
  color: var(--surface-600);
}

.slot-item.selected .slot-status.free {
  color: white;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

.back-btn {
  width: 100%;
}

.back-btn :deep(.p-button) {
  background: transparent;
  border: 1px solid var(--surface-border);
  color: var(--surface-700);
  border-radius: 0.75rem;
  font-weight: 600;
}

.continue-btn {
  width: 100%;
}

.continue-btn :deep(.p-button) {
  background: var(--primary-color);
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
}

.continue-btn :deep(.p-button:disabled) {
  background: var(--surface-300);
  opacity: 0.7;
}
</style>
