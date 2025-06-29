<template>
  <div class="lives-display">
    <div class="stat-header">
      <span class="stat-title">Жизни</span>
      <div class="hearts-container">
        <div 
          v-for="life in maxLives"
          :key="life"
          class="life-heart"
          :class="{ 'life-lost': life > currentLives }"
        >
          ❤️
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentLives: number
  maxLives: number
}

defineProps<Props>()
</script>

<style scoped>
.lives-display {
  @apply flex-shrink-0;
}

.stat-header {
  @apply flex items-center gap-2;
}

.stat-title {
  @apply text-sm font-semibold text-primary;
}

/* Стили для жизней */
.hearts-container {
  @apply flex gap-1;
}

.life-heart {
  @apply text-sm transition-all duration-300;
}

.life-lost {
  @apply opacity-30 grayscale;
}
</style> 