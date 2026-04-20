<script setup lang="ts">
import { useTheme } from "../composables/useTheme";
import Button from "primevue/button";

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <i class="pi pi-calendar logo-icon"></i>
        <span class="logo-text">Calendar</span>
      </router-link>

      <!-- Navigation -->
      <nav class="nav">
        <router-link to="/booking" class="nav-link">Записаться</router-link>
        <router-link to="/admin" class="nav-link">Админка</router-link>

        <!-- Theme Toggle -->
        <Button
          :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
          class="theme-toggle p-button-text p-button-rounded"
          @click="toggleTheme"
          aria-label="Toggle theme"
        />
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-200);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}

.logo-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-color-secondary);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary-color);
}

.theme-toggle {
  color: var(--text-color-secondary);
}

.theme-toggle:hover {
  color: var(--primary-color);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: 0.75rem 1rem;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  .nav {
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.875rem;
  }
}
</style>
