<template>
  <div class="loading-spinner">
    <div class="spinner"></div>
    <p class="loading-text">{{ t('loading.text') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables'

const { t } = useI18n()
// Простой спиннер загрузки
</script>

<style scoped>
.loading-spinner {
  @apply absolute inset-0 flex flex-col items-center justify-center;
  @apply bg-background-primary bg-opacity-80 backdrop-blur-sm;
  z-index: 1000;
}

.spinner {
  @apply w-16 h-16 border-4 border-primary border-t-transparent rounded-full;
  animation: spin 1s linear infinite;
}

.loading-text {
  @apply mt-4 text-lg text-text-secondary;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 