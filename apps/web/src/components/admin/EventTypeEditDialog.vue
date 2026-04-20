<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
// Message removed: using custom error box to ensure visibility
import type { EventType } from "../../types/admin";

interface EventTypePayload {
  title: string;
  durationMinutes: number;
  description?: string;
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
const description = ref("");
const validationError = ref<string | null>(null);

const isEditMode = computed(() => Boolean(props.eventType));

const resetForm = () => {
  title.value = "";
  durationMinutes.value = 30;
  description.value = "";
  validationError.value = null;
};

const fillFormFromEventType = (eventType: EventType) => {
  title.value = eventType.title;
  durationMinutes.value = eventType.durationMinutes;
  description.value = eventType.description || "";
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

  if (description.value.length > 300) {
    validationError.value = "Описание не должно превышать 300 символов";
    return;
  }

  emit("save", {
    title: trimmedTitle,
    durationMinutes: durationMinutes.value,
    description: description.value.trim() || undefined,
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
      <div v-if="validationError" class="error-box">
        <span class="error-left" aria-hidden="true"></span>
        <div class="error-body">
          <span class="error-icon" aria-hidden="true">✖</span>
          <div class="error-text">{{ validationError }}</div>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="event-type-title">
          Название <span style="color: var(--red-500)">*</span>
        </label>
        <InputText
          id="event-type-title"
          v-model="title"
          :disabled="isLoading"
          placeholder="Например, Консультация"
          aria-required="true"
        />
      </div>

      <div class="field-group">
        <label class="field-label" for="event-type-duration">
          Длительность (минуты) <span style="color: var(--red-500)">*</span>
        </label>
        <InputNumber
          id="event-type-duration"
          v-model="durationMinutes"
          :disabled="isLoading"
          :min="15"
          :max="480"
          :step="15"
          showButtons
          aria-required="true"
        />
      </div>

      <div class="field-group">
        <label class="field-label" for="event-type-description"
          >Описание (до 300 символов)</label
        >
        <InputText
          id="event-type-description"
          v-model="description"
          :disabled="isLoading"
          :maxlength="300"
        />
        <small class="char-counter">{{ description.length }} / 300</small>
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

.char-counter {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  align-self: flex-end;
}

/* Custom error box to ensure visibility and single element */
.error-box {
  display: flex;
  align-items: stretch;
  background: rgba(220, 38, 38, 0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.error-left {
  width: 6px;
  background: var(--red-500);
}

.error-body {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 1rem;
}

.error-icon {
  color: var(--red-500);
  font-weight: 700;
}

.error-text {
  color: var(--red-600);
  font-size: 0.95rem;
}
</style>
