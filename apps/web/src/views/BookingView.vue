<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { EventType, AvailableSlot, BookingStep, Guest, Booking } from '../types/booking';
import { 
  useEventTypes, 
  useAvailableSlots, 
  useOwner, 
  useCreateBooking,
  toISODate 
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

// Guest form state
const showGuestForm = ref(false);
const guestForm = reactive<Guest>({
  name: '',
  email: ''
});

const ownerName = computed(() => owner.value?.name || '');

// Load data on mount
onMounted(() => {
  fetchEventTypes();
  fetchOwner();
});

// Watch for date changes to fetch slots
watch(
  () => [state.selectedEventType?.id, state.selectedDate],
  ([eventTypeId, date]) => {
    if (eventTypeId && date) {
      const dateStr = toISODate(date as Date);
      fetchSlots(eventTypeId as string, dateStr, dateStr);
    }
  },
  { immediate: true }
);

// Step 1: Event type selection
const handleEventTypeSelect = (eventType: EventType) => {
  state.selectedEventType = eventType;
  state.step = 'slot-picker';
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
      @back="handleBackToEventTypes"
      @continue="handleContinue"
    />
    
    <!-- Step 3: Success -->
    <BookingSuccess
      v-else-if="state.step === 'success' && state.createdBooking && state.selectedEventType"
      :booking="state.createdBooking"
      :event-type="state.selectedEventType"
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
