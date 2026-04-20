<script setup lang="ts">
import type { Booking } from '../../types/booking';
import Button from 'primevue/button';
import { formatDate, formatSlotTime } from '../../composables/useBooking';

interface Props {
  booking: Booking;
}

defineProps<Props>();

const emit = defineEmits<{
  goHome: [];
}>();

const handleGoHome = () => {
  emit('goHome');
};
</script>

<template>
  <div class="booking-success">
    <div class="success-card">
      <div class="success-header">
        <i class="pi pi-check-circle success-icon"></i>
        <h1 class="success-title">Запись создана</h1>
      </div>
      
      <div class="details-section">
        <h2 class="event-title">{{ booking.eventType.title }}</h2>
        
        <div class="info-blocks">
          <div class="info-block">
            <span class="label">Дата и время</span>
            <span class="value">{{ formatDate(new Date(booking.startTime)) }}, {{ formatSlotTime({ startTime: booking.startTime, endTime: booking.endTime }) }}</span>
          </div>
          
          <div class="info-block">
            <span class="label">Имя</span>
            <span class="value">{{ booking.guest.name }}</span>
          </div>
          
          <div class="info-block">
            <span class="label">Email</span>
            <span class="value">{{ booking.guest.email }}</span>
          </div>
        </div>
      </div>
      
      <Button
        label="На главную"
        class="home-button"
        @click="handleGoHome"
      />
    </div>
  </div>
</template>

<style scoped>
.booking-success {
  min-height: calc(100vh - 73px);
  background: linear-gradient(
    135deg,
    var(--surface-50) 0%,
    var(--surface-100) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.success-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 2.5rem;
  max-width: 480px;
  width: 100%;
  text-align: center;
}

.success-header {
  margin-bottom: 2rem;
}

.success-icon {
  font-size: 4rem;
  color: var(--green-500);
  margin-bottom: 1rem;
  display: block;
}

.success-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--surface-900);
}

.details-section {
  margin-bottom: 2rem;
}

.event-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--surface-900);
}

.info-blocks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
}

.info-block {
  background: var(--surface-50);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
}

.label {
  display: block;
  font-size: 0.75rem;
  color: var(--surface-500);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.value {
  display: block;
  font-size: 1rem;
  color: var(--surface-900);
  font-weight: 500;
}

.home-button :deep(.p-button) {
  width: 100%;
  background: var(--primary-color);
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  padding: 0.875rem 1.5rem;
}

@media (max-width: 640px) {
  .booking-success {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 3rem;
  }
  
  .success-card {
    padding: 1.5rem;
  }
  
  .success-icon {
    font-size: 3rem;
  }
  
  .success-title {
    font-size: 1.5rem;
  }
  
  .event-title {
    font-size: 1.125rem;
  }
}
</style>
