<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import type { EventType } from "../../types/admin";

interface Props {
  eventTypes: EventType[];
  isLoading?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  add: [];
  edit: [eventType: EventType];
  delete: [eventType: EventType];
}>();

const handleAdd = () => {
  emit("add");
};

const handleEdit = (eventType: EventType) => {
  emit("edit", eventType);
};

const handleDelete = (eventType: EventType) => {
  emit("delete", eventType);
};

const formatDuration = (durationMinutes: number): string => {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} мин`;
  }

  if (minutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${minutes} мин`;
};
</script>

<template>
  <div class="event-type-table">
    <div class="table-header">
      <div>
        <h2 class="table-title">Типы событий</h2>
        <p class="table-subtitle">Список доступных типов для бронирования</p>
      </div>
      <Button
        label="Добавить"
        icon="pi pi-plus"
        size="small"
        @click="handleAdd"
      />
    </div>

    <DataTable
      :value="eventTypes"
      :loading="isLoading"
      class="p-datatable-sm"
      stripedRows
    >
      <Column field="title" header="Название" />

      <Column header="Длительность">
        <template #body="{ data }">
          <span>{{ formatDuration(data.durationMinutes) }}</span>
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
          <i class="pi pi-list empty-icon"></i>
          <p>Нет типов событий</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.event-type-table {
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
