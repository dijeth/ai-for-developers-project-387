<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import OwnerProfileForm from "../components/admin/OwnerProfileForm.vue";
import WorkingHoursEditor from "../components/admin/WorkingHoursEditor.vue";
import TimeOffTable from "../components/admin/TimeOffTable.vue";
import TimeOffEditDialog from "../components/admin/TimeOffEditDialog.vue";
import {
  useAdminBookings,
  useAdminOwner,
  useAdminTimeOffs,
  useAdminWorkingHours,
} from "../composables/useAdminDashboard";
import type { Owner, DayOfWeek, WorkingHoursTimeOff } from "../types/admin";

const toast = useToast();

const { bookings, fetchBookings } = useAdminBookings();

const {
  owner,
  isLoading: ownerLoading,
  fetchOwner,
  updateOwner,
  maxBookingDate,
} = useAdminOwner();
const {
  workingHours,
  workingDays,
  isLoading: workingHoursLoading,
  fetchWorkingHours,
  replaceWorkingHours,
} = useAdminWorkingHours();
const {
  timeOffs,
  isLoading: timeOffsLoading,
  fetchTimeOffs,
  createTimeOff,
  updateTimeOff,
  deleteTimeOff,
} = useAdminTimeOffs();

const isSavingProfile = ref(false);
const isSavingHours = ref(false);
const isSavingTimeOff = ref(false);
const timeOffDialogVisible = ref(false);
const selectedTimeOff = ref<WorkingHoursTimeOff | null>(null);

const actualTimeOffs = computed(() => {
  const now = Date.now();
  return timeOffs.value.filter((timeOff) => {
    return new Date(timeOff.endDateTime).getTime() >= now;
  });
});

const datesWithBookings = computed(() => {
  const dates = new Set<string>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  bookings.value.forEach((booking) => {
    const date = new Date(booking.startTime);
    const bookingDateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (bookingDateOnly >= today) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      dates.add(`${year}-${month}-${day}`);
    }
  });

  return dates;
});

// Load data on mount
onMounted(async () => {
  await Promise.all([
    fetchOwner(),
    fetchWorkingHours(),
    fetchTimeOffs(),
    fetchBookings(),
  ]);
});

const handleProfileSave = async (data: Partial<Owner>) => {
  isSavingProfile.value = true;
  try {
    await updateOwner(data);
    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: "Профиль сохранен",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        error instanceof Error
          ? error.message
          : "Ошибка при сохранении профиля",
      life: 3000,
    });
  } finally {
    isSavingProfile.value = false;
  }
};

const handleHoursSave = async (
  updates: { weekday: DayOfWeek; startTime: string; endTime: string }[],
) => {
  isSavingHours.value = true;
  try {
    await replaceWorkingHours(updates);

    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: "Рабочие часы сохранены",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        error instanceof Error
          ? error.message
          : "Ошибка при сохранении рабочих часов",
      life: 3000,
    });
  } finally {
    isSavingHours.value = false;
  }
};

const openCreateTimeOffDialog = () => {
  selectedTimeOff.value = null;
  timeOffDialogVisible.value = true;
};

const openEditTimeOffDialog = (timeOff: WorkingHoursTimeOff) => {
  selectedTimeOff.value = timeOff;
  timeOffDialogVisible.value = true;
};

const handleTimeOffSave = async (payload: {
  startDateTime: string;
  endDateTime: string;
}) => {
  isSavingTimeOff.value = true;
  try {
    if (selectedTimeOff.value) {
      await updateTimeOff(selectedTimeOff.value.id, payload);
      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Time-off обновлен",
        life: 3000,
      });
    } else {
      await createTimeOff(payload);
      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Time-off создан",
        life: 3000,
      });
    }

    selectedTimeOff.value = null;
    timeOffDialogVisible.value = false;
    await fetchTimeOffs();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        error instanceof Error
          ? error.message
          : "Ошибка при сохранении time-off",
      life: 3000,
    });
  } finally {
    isSavingTimeOff.value = false;
  }
};

const handleTimeOffDelete = async (timeOff: WorkingHoursTimeOff) => {
  const shouldDelete = window.confirm("Удалить выбранный time-off?");
  if (!shouldDelete) {
    return;
  }

  isSavingTimeOff.value = true;
  try {
    await deleteTimeOff(timeOff.id);
    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: "Time-off удален",
      life: 3000,
    });
    await fetchTimeOffs();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        error instanceof Error ? error.message : "Ошибка при удалении time-off",
      life: 3000,
    });
  } finally {
    isSavingTimeOff.value = false;
  }
};
</script>

<template>
  <div class="profile-settings-view">
    <Toast />

    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Редактирование профиля</h1>
        <p class="page-subtitle">
          Управляйте основными данными и рабочим расписанием
        </p>
      </div>

      <!-- Three Column Layout -->
      <div class="layout-grid">
        <!-- First Column: Profile Form -->
        <div class="column left-column">
          <div class="card">
            <OwnerProfileForm
              :owner="owner"
              :is-loading="ownerLoading"
              @save="handleProfileSave"
            />
          </div>
        </div>

        <!-- Second Column: Working Hours -->
        <div class="column middle-column">
          <div class="card">
            <WorkingHoursEditor
              :working-hours="workingHours"
              :is-loading="workingHoursLoading"
              @save="handleHoursSave"
            />
          </div>
        </div>

        <!-- Third Column: Time-offs -->
        <div class="column right-column">
          <div class="card">
            <TimeOffTable
              :time-offs="actualTimeOffs"
              :is-loading="timeOffsLoading || isSavingTimeOff"
              @add="openCreateTimeOffDialog"
              @edit="openEditTimeOffDialog"
              @delete="handleTimeOffDelete"
            />
          </div>
        </div>
      </div>

      <TimeOffEditDialog
        :visible="timeOffDialogVisible"
        :time-off="selectedTimeOff"
        :working-days="workingDays"
        :marked-dates="datesWithBookings"
        :max-date="maxBookingDate"
        :is-loading="isSavingTimeOff"
        @update:visible="timeOffDialogVisible = $event"
        @save="handleTimeOffSave"
      />
    </div>
  </div>
</template>

<style scoped>
.profile-settings-view {
  min-height: 100vh;
  background-color: var(--surface-ground);
  padding: 1.5rem;
}

.page-container {
  max-width: 90rem;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin-top: 0.5rem;
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  align-items: start;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: var(--surface-card);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 640px) {
  .profile-settings-view {
    padding: 1rem;
  }

  .page-container {
    max-width: 100%;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .card {
    padding: 1rem;
  }
}
</style>
