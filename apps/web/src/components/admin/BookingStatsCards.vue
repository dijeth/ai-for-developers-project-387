<script setup lang="ts">
import Card from 'primevue/card';
import type { BookingStats } from '../../types/admin';

interface Props {
  stats: BookingStats;
}

defineProps<Props>();

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} мин`;
  if (mins === 0) return `${hours} ч`;
  return `${hours} ч ${mins} мин`;
};
</script>

<template>
  <div class="stats-grid">
    <div class="stats-left">
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon today">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.today }}</span>
              <span class="stat-label">Сегодня</span>
              <span v-if="stats.totalDurationToday > 0" class="stat-sublabel mobile-hide">
                {{ formatDuration(stats.totalDurationToday) }}
              </span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon week">
              <i class="pi pi-th-large"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.thisWeek }}</span>
              <span class="stat-label">Неделя</span>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Card class="stat-card">
      <template #content>
        <div class="stat-content">
          <div class="stat-icon month">
            <i class="pi pi-calendar-plus"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.thisMonth }}</span>
            <span class="stat-label">Месяц</span>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stats-left {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.stat-card {
  background: var(--surface-card);
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card :deep(.p-card-content) {
  padding: 1rem;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.today {
  background: var(--primary-100);
  color: var(--primary-600);
}

.stat-icon.week {
  background: var(--green-100);
  color: var(--green-600);
}

.stat-icon.month {
  background: var(--orange-100);
  color: var(--orange-600);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--surface-900);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--surface-600);
  font-weight: 500;
}

.stat-sublabel {
  font-size: 0.75rem;
  color: var(--surface-500);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .stats-left {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .stat-card :deep(.p-card-content) {
    padding: 0.75rem;
  }

  .stat-content {
    flex-direction: row;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    gap: 0.5rem;
  }

  .stats-left {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-card :deep(.p-card-content) {
    padding: 0.75rem 0.5rem;
  }

  .stat-content {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-icon {
    display: none;
  }

  .stat-info {
    align-items: center;
    text-align: center;
    gap: 0.125rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .mobile-hide {
    display: none;
  }
}
</style>
