<script setup lang="ts">
import { computed } from 'vue';
import type { EventType } from '../../types/booking';
import EventTypeCard from './EventTypeCard.vue';

interface Props {
  eventTypes: EventType[];
  ownerName: string;
  ownerAvatar?: string;
}

const props = defineProps<Props>();

const avatarUrl = computed(() => {
  return props.ownerAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tota';
});

const emit = defineEmits<{
  select: [eventType: EventType];
}>();

const handleSelect = (eventType: EventType) => {
  emit('select', eventType);
};
</script>

<template>
  <div class="event-type-selection">
    <div class="header-card">
      <div class="header-content">
        <div class="avatar-row">
          <div class="avatar">
            <img :src="avatarUrl" :alt="ownerName" />
          </div>
          <div class="user-info">
            <span class="name">{{ ownerName }}</span>
            <span class="role">Host</span>
          </div>
        </div>
        <h1 class="title">Выберите тип события</h1>
        <p class="subtitle">Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.</p>
      </div>
    </div>
    
    <div class="cards-grid">
      <EventTypeCard
        v-for="eventType in eventTypes"
        :key="eventType.id"
        :event-type="eventType"
        @select="handleSelect"
      />
    </div>
  </div>
</template>

<style scoped>
.event-type-selection {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.header-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
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
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--surface-900);
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--surface-600);
  line-height: 1.5;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

@media (max-width: 640px) {
  .event-type-selection {
    padding: 1rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
