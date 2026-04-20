<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import type { Booking } from '../../types/admin';
import { formatTimeLocal } from '../../composables/useAdminDashboard';

interface Props {
  bookings: Booking[];
  title: string;
  isLoading?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  cancel: [bookingId: string];
}>();

const handleCancel = (bookingId: string) => {
  emit('cancel', bookingId);
};

const getSeverity = (startTime: string): 'success' | 'warn' | 'secondary' => {
  const now = new Date();
  const bookingTime = new Date(startTime);
  
  if (bookingTime < now) {
    return 'secondary'; // Past
  }
  
  const diffHours = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffHours <= 24) {
    return 'warn'; // Less than 24 hours
  }
  
  return 'success'; // Future
};

const getStatusLabel = (startTime: string): string => {
  const now = new Date();
  const bookingTime = new Date(startTime);
  
  if (bookingTime < now) {
    return 'Завершено';
  }
  
  const diffHours = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffHours <= 24) {
    return 'Скоро';
  }
  
  return 'Ожидается';
};

const isFutureBooking = (startTime: string): boolean => {
  const now = new Date();
  const bookingTime = new Date(startTime);
  return bookingTime >= now;
};
</script>

<template>
  <div class="booking-table-container">
    <div class="table-header">
      <h2 class="table-title">{{ title }}</h2>
      <span v-if="!isLoading" class="booking-count">
        {{ bookings.length }} {{ bookings.length === 1 ? 'запись' : bookings.length < 5 ? 'записи' : 'записей' }}
      </span>
    </div>
    
    <DataTable 
      :value="bookings" 
      :loading="isLoading"
      class="p-datatable-sm"
      stripedRows
      :paginator="bookings.length > 10"
      :rows="10"
    >
      <Column field="startTime" header="Время" sortable>
        <template #body="{ data }">
          <div class="time-cell">
            <span class="time-primary">{{ formatTimeLocal(data.startTime) }}</span>
            <span class="time-secondary">— {{ formatTimeLocal(data.endTime) }}</span>
          </div>
        </template>
      </Column>

      <Column field="guest" header="Гость">
        <template #body="{ data }">
          <div class="guest-cell">
            <span class="guest-name">{{ data.guest.name }}</span>
            <span class="guest-email">{{ data.guest.email }}</span>
          </div>
        </template>
      </Column>

      <Column field="eventType" header="Тип встречи">
        <template #body="{ data }">
          <div class="event-cell">
            <span class="event-title">{{ data.eventType.title }}</span>
            <span class="event-duration">{{ data.eventType.durationMinutes }} мин</span>
          </div>
        </template>
      </Column>

      <Column field="status" header="Статус">
        <template #body="{ data }">
          <Tag :severity="getSeverity(data.startTime)" :value="getStatusLabel(data.startTime)" />
        </template>
      </Column>

      <Column header="Действия" style="width: 100px">
        <template #body="{ data }">
          <Button 
            v-if="isFutureBooking(data.startTime)"
            icon="pi pi-times" 
            severity="danger" 
            text 
            rounded
            size="small"
            @click="handleCancel(data.id)"
            v-tooltip.left="'Отменить бронирование'"
          />
        </template>
      </Column>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-calendar-times empty-icon"></i>
          <p>Нет бронирований на выбранную дату</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.booking-table-container {
  background: var(--surface-card);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--surface-900);
}

.booking-count {
  font-size: 0.875rem;
  color: var(--surface-500);
  background: var(--surface-100);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
}

.time-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-primary {
  font-weight: 600;
  color: var(--surface-900);
}

.time-secondary {
  font-size: 0.875rem;
  color: var(--surface-500);
}

.guest-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.guest-name {
  font-weight: 500;
  color: var(--surface-900);
}

.guest-email {
  font-size: 0.875rem;
  color: var(--surface-500);
}

.event-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-title {
  font-weight: 500;
  color: var(--surface-900);
}

.event-duration {
  font-size: 0.875rem;
  color: var(--primary-600);
  background: var(--primary-50);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  width: fit-content;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--surface-500);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  color: var(--surface-300);
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

:deep(.p-datatable) {
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.p-datatable-header) {
  background: transparent;
  border: none;
}

:deep(.p-datatable-thead > tr > th) {
  background: var(--surface-50);
  color: var(--surface-700);
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: var(--surface-50);
}
</style>
