<script setup lang="ts">
import { computed } from "vue";
import type { EventType, AvailableSlot } from "../../types/booking";
import { formatDate, formatSlotTime } from "../../composables/useBooking";

interface Props {
  eventType: EventType;
  selectedDate: Date | null;
  selectedSlot: AvailableSlot | null;
  ownerName: string;
  ownerAvatar?: string;
}

const props = defineProps<Props>();

const avatarUrl = computed(() => {
  return (
    props.ownerAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Tota"
  );
});
</script>

<template>
  <div class="event-type-summary">
    <div class="card-content">
      <div class="header-row">
        <div class="avatar">
          <img :src="avatarUrl" :alt="ownerName" />
        </div>
        <div class="user-info">
          <span class="name">{{ ownerName }}</span>
          <span class="role">Host</span>
        </div>
      </div>

      <h2 class="title">{{ eventType.title }}</h2>
      <span class="duration-badge">{{ eventType.durationMinutes }} мин</span>

      <p class="description">
        {{ eventType.description }}
      </p>
    </div>

    <div class="info-blocks">
      <div class="info-block">
        <span class="label">Выбранная дата</span>
        <span class="value">{{
          selectedDate ? formatDate(selectedDate) : "Дата не выбрана"
        }}</span>
      </div>
      <div class="info-block">
        <span class="label">Выбранное время</span>
        <span class="value">{{
          selectedSlot ? formatSlotTime(selectedSlot) : "Время не выбрано"
        }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-type-summary {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
}

.card-content {
  margin-bottom: 1.25rem;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-100);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--surface-900);
}

.role {
  font-size: 0.75rem;
  color: var(--surface-500);
}

.title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--surface-900);
}

.duration-badge {
  display: inline-block;
  background: var(--surface-100);
  color: var(--surface-600);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;
}

.description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--surface-600);
  line-height: 1.5;
}

.info-blocks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-block {
  background: var(--surface-50);
  border-radius: 0.5rem;
  padding: 0.875rem 1rem;
}

.label {
  display: block;
  font-size: 0.75rem;
  color: var(--surface-500);
  margin-bottom: 0.25rem;
}

.value {
  display: block;
  font-size: 0.9375rem;
  color: var(--surface-900);
  font-weight: 500;
}
</style>
