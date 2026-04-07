<script setup lang="ts">
import Card from "primevue/card";
import Button from "primevue/button";
import { useRouter } from "vue-router";

const router = useRouter();

const goBack = () => {
  router.push("/");
};
</script>

<template>
  <div class="booking-view">
    <div class="booking-container">
      <Card class="booking-card">
        <template #title>
          <h1>Запись на встречу</h1>
        </template>
        <template #content>
          <p class="booking-description">
            Форма бронирования находится в разработке. Скоро здесь появится
            возможность записаться на встречу.
          </p>
          <Button
            label="Вернуться на главную"
            icon="pi pi-arrow-left"
            class="back-button p-button-outlined"
            @click="goBack"
          />
        </template>
      </Card>
    </div>
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
  padding: 3rem 1.5rem;
}

.booking-container {
  max-width: 600px;
  margin: 0 auto;
}

.booking-card {
  background: var(--surface-card);
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.booking-description {
  font-size: 1.125rem;
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

h1 {
  margin: 0;
  color: var(--surface-900);
  font-size: 1.75rem;
}

:deep(.back-button) {
  width: fit-content;
  border-radius: 0.75rem;
  font-weight: 600;
  gap: 0.5rem;
  box-shadow: none;
}

@media (max-width: 768px) {
  .booking-view {
    padding: 2rem 1rem;
    background: linear-gradient(
      180deg,
      var(--surface-50) 0%,
      var(--surface-100) 100%
    );
  }

  h1 {
    font-size: 1.5rem;
  }

  .booking-description {
    font-size: 1rem;
  }
}
</style>
