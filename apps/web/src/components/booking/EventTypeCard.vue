<script setup lang="ts">
import type { EventType } from "../../types/booking";

interface Props {
  eventType: EventType;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  select: [eventType: EventType];
}>();

const handleClick = () => {
  emit("select", props.eventType);
};

function getDurationText(minutes: number): string {
  return `${minutes} мин`;
}
</script>

<template>
  <div class="event-type-card" @click="handleClick">
    <div class="card-header">
      <h3 class="title">{{ eventType.title }}</h3>
      <span class="duration-badge">{{
        getDurationText(eventType.durationMinutes)
      }}</span>
    </div>
    <p class="description">{{ eventType.description }}</p>
  </div>
</template>

<style scoped>
.event-type-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 0.75rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-type-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--surface-900);
  line-height: 1.4;
}

.duration-badge {
  flex-shrink: 0;
  background: var(--surface-100);
  color: var(--surface-600);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--surface-600);
  line-height: 1.5;
}
</style>
