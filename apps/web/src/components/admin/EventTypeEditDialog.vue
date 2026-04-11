<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Message from "primevue/message";
import type { EventType } from "../../types/admin";

interface EventTypePayload {
  title: string;
  durationMinutes: number;
}

interface Props {
  visible: boolean;
  eventType?: EventType | null;
  isLoading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:visible": [visible: boolean];
  save: [payload: EventTypePayload];
}>();

const title = ref("");
const durationMinutes = ref<number | null>(30);
const validationError = ref<string | null>(null);

const isEditMode = computed(() => Boolean(props.eventType));

const resetForm = () => {
  title.value = "";
  durationMinutes.value = 30;
  validationError.value = null;
};

const fillFormFromEventType = (eventType: EventType) => {
  title.value = eventType.title;
  durationMinutes.value = eventType.durationMinutes;
  validationError.value = null;
};

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetForm();
      return;
    }

    if (props.eventType) {
      fillFormFromEventType(props.eventType);
      return;
    }

    resetForm();
  },
);

const handleCancel = () => {
  emit("update:visible", false);
};

const handleSave = () => {
  validationError.value = null;

  const trimmedTitle = title.value.trim();
  if (!trimmedTitle) {
    validationError.value = "Укажите название типа события";
    return;
  }

  if (
    !durationMinutes.value ||
    durationMinutes.value < 15 ||
    durationMinutes.value > 480
  ) {
    validationError.value = "Длительность должна быть от 15 до 480 минут";
    return;
  }

  emit("save", {
    title: trimmedTitle,
    durationMinutes: durationMinutes.value,
  });
};
</script>

<template>
  <Dialog
    :visible="visible"
    :header="isEditMode ? 'Редактировать тип события' : 'Добавить тип события'"
    modal
    class="event-type-dialog"
    :closable="!isLoading"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="dialog-content">
      <Message
        v-if="validationError"
        severity="error"
        :text="validationError"
      />

      <div class="field-group">
        <label class="field-label" for="event-type-title">Название</label>
        <InputText
          id="event-type-title"
          v-model="title"
          :disabled="isLoading"
          placeholder="Например, Консультация"
        />
      </div>

      <div class="field-group">
        <label class="field-label" for="event-type-duration"
          >Длительность (минуты)</label
        >
        <InputNumber
          id="event-type-duration"
          v-model="durationMinutes"
          :disabled="isLoading"
          :min="15"
          :max="480"
          :step="15"
          showButtons
        />
      </div>
    </div>

    <template #footer>
      <Button
        label="Отмена"
        severity="secondary"
        text
        :disabled="isLoading"
        @click="handleCancel"
      />
      <Button
        :label="isEditMode ? 'Сохранить' : 'Создать'"
        :loading="isLoading"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 320px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
}

@media (max-width: 640px) {
  .dialog-content {
    min-width: auto;
  }
}
</style>
