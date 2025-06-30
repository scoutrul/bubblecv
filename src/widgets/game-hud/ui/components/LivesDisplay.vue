<template>
  <div class="lives-display" :class="{ 'lives-shake': isShaking }">
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
import { ref, watch } from 'vue'

interface Props {
  currentLives: number
  maxLives: number
}

const props = defineProps<Props>()
const isShaking = ref(false)

// Следим за изменением жизней
watch(() => props.currentLives, (newValue, oldValue) => {
  if (newValue < oldValue) { // Запускаем анимацию только при потере жизней
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 600) // Длительность shake анимации
  }
})
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

/* Shake анимация для панели жизней */
.lives-shake {
  animation: lives-shake 0.6s ease-in-out;
}

@keyframes lives-shake {
  0%, 100% { transform: translate(0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate(-1px, -1px); }
  20%, 40%, 60%, 80% { transform: translate(1px, 1px); }
}
</style> 