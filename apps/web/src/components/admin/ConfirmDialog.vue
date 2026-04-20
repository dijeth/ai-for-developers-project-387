<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

interface Props {
  visible: boolean;
  bookingInfo?: {
    guestName: string;
    startTime: string;
  };
}

defineProps<Props>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  confirm: [];
  cancel: [];
}>();

const handleConfirm = () => {
  emit('confirm');
  emit('update:visible', false);
};

const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Подтвердите отмену"
    modal
    :closable="false"
    class="confirm-dialog"
  >
    <div class="confirm-content">
      <i class="pi pi-exclamation-triangle warning-icon"></i>
      <p class="confirm-message">
        Вы уверены, что хотите отменить бронирование?
      </p>
      <p v-if="bookingInfo" class="confirm-details">
        <strong>{{ bookingInfo.guestName }}</strong><br>
        {{ bookingInfo.startTime }}
      </p>
      <p class="confirm-hint">Это действие нельзя отменить.</p>
    </div>
    
    <template #footer>
      <Button
        label="Нет, оставить"
        severity="secondary"
        text
        @click="handleCancel"
      />
      <Button
        label="Да, отменить"
        severity="danger"
        @click="handleConfirm"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.confirm-dialog :deep(.p-dialog) {
  max-width: 400px;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.5rem;
}

.warning-icon {
  font-size: 3rem;
  color: var(--orange-500);
  margin-bottom: 1rem;
}

.confirm-message {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--surface-900);
  margin: 0 0 0.5rem 0;
}

.confirm-details {
  font-size: 0.875rem;
  color: var(--surface-600);
  margin: 0 0 0.5rem 0;
  background: var(--surface-50);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  width: 100%;
}

.confirm-hint {
  font-size: 0.75rem;
  color: var(--surface-500);
  margin: 0;
}
</style>
