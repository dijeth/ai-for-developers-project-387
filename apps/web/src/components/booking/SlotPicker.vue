<script setup lang="ts">
import { computed } from 'vue';
import type { EventType, AvailableSlot } from '../../types/booking';
import EventTypeSummary from './EventTypeSummary.vue';
import BaseCalendar from '../common/BaseCalendar.vue';
import TimeSlotsPanel from './TimeSlotsPanel.vue';

interface Props {
  eventType: EventType;
  selectedDate: Date;
  selectedSlot: AvailableSlot | null;
  availableSlots: AvailableSlot[];
  isLoadingSlots: boolean;
  maxDate: Date | null;
  workingDays?: string[];
  markedDates?: Set<string>;
  markerType?: 'primary' | 'success';
}

const props = withDefaults(defineProps<Props>(), {
  workingDays: () => ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  markedDates: () => new Set<string>(),
  markerType: 'primary'
});

const emit = defineEmits<{
  'update:selectedDate': [date: Date];
  'update:selectedSlot': [slot: AvailableSlot | null];
  back: [];
  continue: [];
  'month-change': [date: Date];
}>();

const handleDateChange = (date: Date) => {
  emit('update:selectedDate', date);
  emit('update:selectedSlot', null);
};

const handleSlotSelect = (slot: AvailableSlot) => {
  emit('update:selectedSlot', slot);
};

const handleBack = () => {
  emit('back');
};

const handleContinue = () => {
  emit('continue');
};

const handleMonthChange = (date: Date) => {
  emit('month-change', date);
};

// Computed wrapper for calendar v-model
const calendarDate = computed({
  get: () => props.selectedDate,
  set: (value) => {
    if (value) {
      handleDateChange(value);
    }
  }
});
</script>

<template>
  <div class="slot-picker">
    <h1 class="page-title">{{ eventType.title }}</h1>
    
    <div class="three-column-layout">
      <div class="column left-column">
        <EventTypeSummary
          :event-type="eventType"
          :selected-date="selectedDate"
          :selected-slot="selectedSlot"
        />
      </div>
      
      <div class="column middle-column">
        <div class="calendar-panel">
          <div class="panel-header">
            <h3 class="panel-title">Календарь</h3>
          </div>
          <BaseCalendar
            v-model="calendarDate"
            :max-date="maxDate"
            :working-days="workingDays"
            :marked-dates="markedDates"
            :marker-type="markerType"
            :show-legend="true"
            :legend-label="markerType === 'success' ? 'Есть свободные слоты' : 'Есть бронирования'"
            @month-change="handleMonthChange"
          />
        </div>
      </div>
      
      <div class="column right-column">
        <TimeSlotsPanel
          :slots="availableSlots"
          :selected-slot="selectedSlot"
          :is-loading="isLoadingSlots"
          @select="handleSlotSelect"
          @back="handleBack"
          @continue="handleContinue"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.slot-picker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.page-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--surface-900);
}

.three-column-layout {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 1.5rem;
  align-items: start;
}

.column {
  min-height: 500px;
}

.left-column {
  position: sticky;
  top: 2rem;
}

.middle-column {
  min-width: 0;
}

.right-column {
  position: sticky;
  top: 2rem;
}

.calendar-panel {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.panel-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--surface-900);
}

@media (max-width: 1024px) {
  .three-column-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .column {
    min-height: auto;
    position: static;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .slot-picker {
    padding: 1rem;
  }
}
</style>
