<script setup lang="ts">
import { ref, computed, watch } from "vue";
import InputText from "primevue/inputtext";
import InputTextarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import Message from "primevue/message";
import type { Owner } from "../../types/admin";

interface Props {
  owner: Owner | null;
  isLoading?: boolean;
}

interface Emits {
  (e: "save", data: Partial<Owner>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formData = ref<Partial<Owner>>({
  name: "",
  email: "",
  description: "",
  avatar: "",
  timezone: "Europe/Moscow",
  bookingMonthsAhead: 3,
});

const error = ref<string | null>(null);
const isSubmitting = ref(false);

// Common timezones list
const timezones = ref([
  { label: "Europe/Moscow (UTC+3)", value: "Europe/Moscow" },
  { label: "Europe/London (UTC±0)", value: "Europe/London" },
  { label: "Europe/Paris (UTC+1/+2)", value: "Europe/Paris" },
  { label: "Europe/Berlin (UTC+1/+2)", value: "Europe/Berlin" },
  { label: "America/New_York (UTC-5/-4)", value: "America/New_York" },
  { label: "America/Los_Angeles (UTC-8/-7)", value: "America/Los_Angeles" },
  { label: "Asia/Tokyo (UTC+9)", value: "Asia/Tokyo" },
  { label: "Asia/Shanghai (UTC+8)", value: "Asia/Shanghai" },
  { label: "Asia/Singapore (UTC+8)", value: "Asia/Singapore" },
  { label: "Australia/Sydney (UTC+10/+11)", value: "Australia/Sydney" },
  { label: "UTC", value: "UTC" },
]);

// Watch for prop changes and update form
watch(
  () => props.owner,
  (newOwner) => {
    if (newOwner) {
      formData.value = {
        name: newOwner.name || "",
        email: newOwner.email || "",
        description: newOwner.description || "",
        avatar: newOwner.avatar || "",
        timezone: newOwner.timezone || "Europe/Moscow",
        bookingMonthsAhead: newOwner.bookingMonthsAhead || 3,
      };
    }
  },
  { immediate: true, deep: true },
);

const isFormValid = computed(() => {
  const { name, email } = formData.value;
  if (!name || !email) return false;
  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
});

const avatarPreviewUrl = computed(() => {
  return (
    formData.value.avatar ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Tota"
  );
});

const handleSave = async () => {
  if (!isFormValid.value) {
    error.value = "Please fill in all required fields correctly";
    return;
  }

  error.value = null;
  isSubmitting.value = true;

  try {
    // Emit save event with form data
    emit("save", formData.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Unknown error";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="owner-profile-form">
    <h2 class="form-title">Профиль владельца</h2>

    <Message
      v-if="error"
      severity="error"
      :text="error"
      class="error-message"
    />

    <form @submit.prevent="handleSave" class="form-container">
      <!-- Avatar Preview -->
      <div class="avatar-section">
        <label class="form-label">Аватар</label>
        <div class="avatar-preview-container">
          <img
            :src="avatarPreviewUrl"
            :alt="formData.name || 'Avatar'"
            class="avatar-image"
          />
          <div class="avatar-input-section">
            <label class="form-label">URL аватара</label>
            <InputText
              v-model="formData.avatar"
              type="text"
              placeholder="https://api.dicebear.com/7.x/avataaars/svg?seed=Tota"
              class="form-input"
            />
            <small class="form-hint">
              Ссылка на изображение (JPG, PNG, GIF)
            </small>
          </div>
        </div>
      </div>

      <!-- Name -->
      <div class="form-group">
        <label class="form-label"> Имя <span class="required">*</span> </label>
        <InputText
          v-model="formData.name"
          type="text"
          placeholder="Ваше имя"
          class="form-input"
          :disabled="isLoading || isSubmitting"
        />
      </div>

      <!-- Email -->
      <div class="form-group">
        <label class="form-label">
          Email <span class="required">*</span>
        </label>
        <InputText
          v-model="formData.email"
          type="email"
          placeholder="your@email.com"
          class="form-input"
          :disabled="isLoading || isSubmitting"
        />
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="form-label">Описание</label>
        <InputTextarea
          v-model="formData.description"
          placeholder="Расскажите о себе"
          class="form-input"
          :rows="4"
          :disabled="isLoading || isSubmitting"
        />
      </div>

      <!-- Timezone Dropdown -->
      <div class="form-group">
        <label class="form-label">Часовой пояс</label>
        <Dropdown
          v-model="formData.timezone"
          :options="timezones"
          option-label="label"
          option-value="value"
          placeholder="Выберите часовой пояс"
          class="form-input"
          :disabled="isLoading || isSubmitting"
        />
      </div>

      <!-- Booking Months Ahead -->
      <div class="form-group">
        <label class="form-label">Кол-во месяцев для бронирования</label>
        <InputNumber
          v-model="formData.bookingMonthsAhead"
          :min="1"
          :max="12"
          placeholder="3"
          class="form-input"
          :disabled="isLoading || isSubmitting"
        />
      </div>

      <!-- Save Button -->
      <Button
        type="submit"
        label="Сохранить профиль"
        icon="pi pi-save"
        :loading="isSubmitting || isLoading"
        class="save-button"
      />
    </form>
  </div>
</template>

<style scoped>
.owner-profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.error-message {
  margin-bottom: 1rem;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}

.required {
  color: var(--red-500);
}

.form-input {
  width: 100%;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin-top: 0.25rem;
  display: block;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.avatar-preview-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-image {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--surface-border);
  flex-shrink: 0;
}

.avatar-input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.save-button {
  width: 100%;
  margin-top: 1rem;
}
</style>
