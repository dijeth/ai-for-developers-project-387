<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { EventType, AvailableSlot, BookingStep, Guest, Booking } from '../types/booking';
import { 
  useEventTypes, 
  useAvailableSlots, 
  useOwner, 
  useCreateBooking,
  toUTCDateString,
  toUTCEndOfDayString
} from '../composables/useBooking';
import EventTypeSelection from '../components/booking/EventTypeSelection.vue';
import SlotPicker from '../components/booking/SlotPicker.vue';
import BookingSuccess from '../components/booking/BookingSuccess.vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const router = useRouter();

// FSM State
const state = reactive({
  step: 'event-type' as BookingStep,
  selectedEventType: null as EventType | null,
  selectedDate: new Date(),
  selectedSlot: null as AvailableSlot | null,
  createdBooking: null as Booking | null,
});

// API hooks
const { eventTypes, isLoading: loadingEventTypes, fetchEventTypes } = useEventTypes();
const { slots: availableSlots, isLoading: loadingSlots, fetchSlots } = useAvailableSlots();
const { owner, fetchOwner, maxBookingDate } = useOwner();
const { createBooking, isLoading: creatingBooking } = useCreateBooking();

// Monthly slots for calendar markers (loaded when month changes)
const monthlySlots = ref<AvailableSlot[]>([]);
const currentMonth = ref(new Date());

// Guest form state
const showGuestForm = ref(false);
const guestForm = reactive<Guest>({
  name: '',
  email: ''
});

const ownerName = computed(() => owner.value?.name || '');

// Working days from owner settings
const workingDays = computed(() => {
  return owner.value?.workingHours?.workingDays || ['mon', 'tue', 'wed', 'thu', 'fri'];
});

// Get set of dates that have available slots (for calendar markers)
const datesWithSlots = computed(() => {
  const dates = new Set<string>();
  monthlySlots.value.forEach(slot => {
    const date = new Date(slot.startTime);
    // Use local date components to match calendar display
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;
    dates.add(key);
  });
  return dates;
});

// Helper to check if month is current month
const isCurrentMonth = (date: Date): boolean => {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

// Fetch slots for the entire month (for calendar markers)
const fetchMonthSlots = async (eventTypeId: string, monthDate: Date) => {
  let dateFrom: string;
  
  if (isCurrentMonth(monthDate)) {
    // For current month, use current UTC time (not start of day)
    dateFrom = new Date().toISOString();
  } else {
    // For future months, use start of month
    dateFrom = toUTCDateString(monthDate);
  }
  
  const dateTo = toUTCEndOfDayString(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0));
  
  // Reuse fetchSlots logic but store in monthlySlots
  const response = await fetch(`/api/event-types/${eventTypeId}/available-slots?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`);
  if (response.ok) {
    const data = await response.json();
    monthlySlots.value = data.slots;
  }
};

// Load data on mount
onMounted(() => {
  fetchEventTypes();
  fetchOwner();
});

// Watch for date changes to fetch slots for the specific date
watch(
  () => [state.selectedEventType?.id, state.selectedDate],
  ([eventTypeId, date]) => {
    if (eventTypeId && date) {
      const dateFrom = toUTCDateString(date as Date);
      const dateTo = toUTCEndOfDayString(date as Date);
      fetchSlots(eventTypeId as string, dateFrom, dateTo);
    }
  },
  { immediate: true }
);

// Watch for event type selection to load initial month slots
watch(
  () => state.selectedEventType?.id,
  (eventTypeId) => {
    if (eventTypeId) {
      fetchMonthSlots(eventTypeId, currentMonth.value);
    }
  },
  { immediate: true }
);

// Step 1: Event type selection
const handleEventTypeSelect = (eventType: EventType) => {
  state.selectedEventType = eventType;
  state.step = 'slot-picker';
  // Note: fetchMonthSlots is called via watch on selectedEventType?.id
};

// Handle month change in calendar
const handleMonthChange = async (newMonthDate: Date) => {
  currentMonth.value = newMonthDate;
  if (state.selectedEventType) {
    await fetchMonthSlots(state.selectedEventType.id, newMonthDate);
  }
};

// Step 2: Navigation
const handleBackToEventTypes = () => {
  state.step = 'event-type';
  state.selectedEventType = null;
  state.selectedSlot = null;
};

const handleContinue = () => {
  if (state.selectedSlot) {
    showGuestForm.value = true;
  }
};

// Guest form submit
const handleGuestSubmit = async () => {
  if (!state.selectedEventType || !state.selectedSlot) return;
  
  try {
    const booking = await createBooking({
      eventTypeId: state.selectedEventType.id,
      startTime: state.selectedSlot.startTime,
      guest: { ...guestForm }
    });
    
    // Store the created booking and show success step
    state.createdBooking = booking;
    state.step = 'success';
    showGuestForm.value = false;
  } catch (e) {
    console.error('Booking failed:', e);
    // Handle error - could show error message to user
  }
};

const handleGoHome = () => {
  router.push('/');
};

const handleCancelGuestForm = () => {
  showGuestForm.value = false;
  guestForm.name = '';
  guestForm.email = '';
};
</script>

<template>
  <div class="booking-view">
    <!-- Step 1: Event Type Selection -->
    <EventTypeSelection
      v-if="state.step === 'event-type'"
      :event-types="eventTypes"
      :owner-name="ownerName"
      @select="handleEventTypeSelect"
    />
    
    <!-- Step 2: Slot Picker -->
    <SlotPicker
      v-else-if="state.step === 'slot-picker' && state.selectedEventType"
      :event-type="state.selectedEventType"
      v-model:selected-date="state.selectedDate"
      v-model:selected-slot="state.selectedSlot"
      :available-slots="availableSlots"
      :is-loading-slots="loadingSlots"
      :max-date="maxBookingDate"
      :working-days="workingDays"
      :marked-dates="datesWithSlots"
      marker-type="success"
      @back="handleBackToEventTypes"
      @continue="handleContinue"
      @month-change="handleMonthChange"
    />
    
    <!-- Step 3: Success -->
    <BookingSuccess
      v-else-if="state.step === 'success' && state.createdBooking"
      :booking="state.createdBooking"
      @go-home="handleGoHome"
    />
    
    <!-- Loading State -->
    <div v-if="loadingEventTypes" class="loading-container">
      <span class="loading-text">Загрузка...</span>
    </div>
    
    <!-- Guest Form Dialog -->
    <Dialog
      v-model:visible="showGuestForm"
      header="Введите данные"
      modal
      :closable="false"
      class="guest-dialog"
    >
      <div class="guest-form">
        <div class="form-field">
          <label for="name">Имя</label>
          <InputText
            id="name"
            v-model="guestForm.name"
            placeholder="Введите ваше имя"
          />
        </div>
        <div class="form-field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="guestForm.email"
            placeholder="Введите ваш email"
          />
        </div>
      </div>
      
      <template #footer>
        <Button
          label="Отмена"
          class="p-button-outlined"
          @click="handleCancelGuestForm"
        />
        <Button
          label="Записаться"
          :disabled="!guestForm.name || !guestForm.email || creatingBooking"
          :loading="creatingBooking"
          @click="handleGuestSubmit"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.booking-view {
  min-height: calc(100vh - 73px);
  background: linear-gradient(
    135deg,
    var(--surface-50) 0%,
    var(--surface-100) 100%
  );
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 73px);
}

.loading-text {
  font-size: 1.125rem;
  color: var(--surface-600);
}

.guest-dialog :deep(.p-dialog) {
  max-width: 400px;
}

.guest-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--surface-700);
}
</style>
