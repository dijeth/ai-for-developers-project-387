<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import { useRouter } from "vue-router";

const router = useRouter();

const goToBooking = () => {
  router.push("/booking");
};
</script>

<template>
  <section class="hero">
    <div class="hero-container">
      <!-- Left Column -->
      <div class="hero-content">
        <div class="badge">БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК</div>
        <h1 class="hero-title">Calendar</h1>
        <p class="hero-description">
          Забронируйте встречу за минуту: выберите тип события и удобное время.
        </p>
        <Button
          label="Записаться"
          icon="pi pi-arrow-right"
          icon-pos="right"
          class="p-button-lg cta-button"
          @click="goToBooking"
        />
      </div>

      <!-- Right Column -->
      <div class="hero-features">
        <Card class="features-card">
          <template #title>
            <h3 class="features-title">Возможности</h3>
          </template>
          <template #content>
            <ul class="features-list">
              <li class="feature-item">
                <i class="pi pi-check-circle feature-icon"></i>
                <span>Выбор типа события и удобного времени для встречи.</span>
              </li>
              <li class="feature-item">
                <i class="pi pi-check-circle feature-icon"></i>
                <span
                  >Быстрое бронирование с подтверждением и дополнительными
                  заметками.</span
                >
              </li>
              <li class="feature-item">
                <i class="pi pi-check-circle feature-icon"></i>
                <span
                  >Управление типами встреч и просмотр предстоящих записей в
                  админке.</span
                >
              </li>
            </ul>
          </template>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: calc(100vh - 73px);
  background: linear-gradient(
    135deg,
    var(--surface-50) 0%,
    var(--surface-100) 100%
  );
  padding: 3rem 1.5rem;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.badge {
  display: inline-block;
  background-color: var(--surface-100);
  color: var(--text-color-secondary);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  width: fit-content;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--surface-900);
  margin: 0;
  line-height: 1.1;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-color);
  line-height: 1.6;
  margin: 0;
  max-width: 480px;
}

:deep(.cta-button) {
  width: fit-content;
  padding: 1rem 2rem;
  font-weight: 600;
  border-radius: 0.75rem;
  box-shadow: none;
  gap: 0.5rem;
}

:deep(.cta-button:hover) {
  box-shadow: none;
}

.hero-features {
  display: flex;
  justify-content: center;
}

.features-card {
  width: 100%;
  max-width: 480px;
  background: var(--surface-card);
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.features-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--surface-900);
  margin: 0 0 1rem 0;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.5;
}

.feature-icon {
  color: var(--primary-color);
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem;
    background: linear-gradient(
      180deg,
      var(--surface-50) 0%,
      var(--surface-100) 100%
    );
  }

  .hero-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.125rem;
  }

  :deep(.cta-button) {
    width: 100%;
    justify-content: center;
  }

  .features-card {
    max-width: 100%;
  }
}
</style>
