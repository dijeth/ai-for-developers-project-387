<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import type { WorkingHoursTimeOff } from "../../types/admin";
import { formatLocalDate, formatLocalTime } from "../../utils/date.utils";

interface Props {
  timeOffs: WorkingHoursTimeOff[];
  isLoading?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  add: [];
  edit: [timeOff: WorkingHoursTimeOff];
  delete: [timeOff: WorkingHoursTimeOff];
}>();

const handleAdd = () => {
  emit("add");
};

const handleEdit = (timeOff: WorkingHoursTimeOff) => {
  emit("edit", timeOff);
};

const handleDelete = (timeOff: WorkingHoursTimeOff) => {
  emit("delete", timeOff);
};

const formatDay = (value: string): string => {
  return formatLocalDate(new Date(value));
};

const formatRange = (startValue: string, endValue: string): string => {
  return `${formatLocalTime(startValue)} - ${formatLocalTime(endValue)}`;
};
</script>

<template>
  <div class="time-off-table">
    <div class="table-header">
      <div>
        <h2 class="table-title">Time-offs</h2>
        <p class="table-subtitle">Актуальные периоды недоступности</p>
      </div>
      <Button
        label="Добавить"
        icon="pi pi-plus"
        size="small"
        @click="handleAdd"
      />
    </div>

    <DataTable
      :value="timeOffs"
      :loading="isLoading"
      class="p-datatable-sm"
      stripedRows
    >
      <Column header="День">
        <template #body="{ data }">
          <span>{{ formatDay(data.startDateTime) }}</span>
        </template>
      </Column>

      <Column header="Время">
        <template #body="{ data }">
          <span>{{ formatRange(data.startDateTime, data.endDateTime) }}</span>
        </template>
      </Column>

      <Column header="Действия" style="width: 120px">
        <template #body="{ data }">
          <div class="actions">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              @click="handleEdit(data)"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              size="small"
              @click="handleDelete(data)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-calendar-times empty-icon"></i>
          <p>Нет актуальных time-offs</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.time-off-table {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.table-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

.table-subtitle {
  margin: 0.25rem 0 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: var(--text-color-secondary);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin: 0;
}
</style>
