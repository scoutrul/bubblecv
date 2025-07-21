<template>
  <BaseModal
    :is-open="isVisible"
    :allow-escape-close="allowEscapeClose"
    @close="$emit('close')"
    class-name="game-over-modal-container"
  >

    <div class="game-over-header">
      <div class="skull-icon">💀</div>
      <h2 class="game-over-title">GAME OVER</h2>
      <p class="game-over-subtitle">Все жизни потеряны!</p>

      <div class="philosophy-message">
        <p class="philosophy-text">
          🤔 <strong>Наши цели и ценности не совпадают.</strong>
        </p>
        <p class="philosophy-subtext">
          Видимо, мы по-разному смотрим на разработку и командную работу.
          Эффективное сотрудничество в таких условиях будет затруднительно.
        </p>
        <p class="retry-suggestion">
          💡 <em>Попробуйте пройти игру заново, возможно, стоит быть более лояльным к философии команды...</em>
        </p>
      </div>
    </div>

    <div class="game-over-stats">
      <div class="stat-row">
        <span class="stat-label">Достигнутый уровень:</span>
        <span class="stat-value">{{ currentLevel }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Набрано опыта:</span>
        <span class="stat-value">{{ currentXP }} XP</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Исследовано пузырей:</span>
        <span class="stat-value">{{ visitedBubblesCount }}</span>
      </div>
    </div>

    <div class="game-over-actions">
      <button @click="$emit('restart')" class="restart-button">
        🔄 Начать заново
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/global/BaseModal.vue'

import { useApp } from '@/composables'
import { computed } from 'vue'

interface Props {
  isVisible: boolean
  allowEscapeClose?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'restart'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { game: { currentLevel, currentXP, visitedBubbles } } = useApp()

const visitedBubblesCount = computed(() => visitedBubbles.value.length)


</script>

<style scoped>
:deep(.game-over-modal-container) {
  @apply bg-background-primary border border-border rounded-lg shadow-xl;
  @apply p-6 max-w-lg w-full mx-4;
  @apply transform transition-all duration-300;
  @apply text-center relative;
}

.game-over-modal {
  @apply text-center relative;
}

.game-over-header {
  @apply mb-6;
}

.skull-icon {
  @apply text-6xl mb-4;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}

.game-over-title {
  @apply text-3xl font-bold text-red-500 mb-2;
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
}

.game-over-subtitle {
  @apply text-text-secondary;
}

.philosophy-message {
  @apply mt-6 p-4 rounded-lg;
  @apply bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800;
  @apply text-left space-y-3;
}

.philosophy-text {
  @apply text-amber-800 dark:text-amber-200 text-sm;
  @apply flex items-center gap-2;
}

.philosophy-subtext {
  @apply text-amber-700 dark:text-amber-300 text-sm leading-relaxed;
}

.retry-suggestion {
  @apply text-amber-600 dark:text-amber-400 text-sm;
  @apply border-t border-amber-200 dark:border-amber-700 pt-3 mt-3;
}

.game-over-stats {
  @apply space-y-3 mb-6;
  @apply bg-background-secondary rounded-lg p-4;
}

.stat-row {
  @apply flex justify-between items-center;
}

.stat-label {
  @apply text-text-secondary;
}

.stat-value {
  @apply font-semibold text-primary;
}

.game-over-actions {
  @apply space-y-3;
}

.restart-button {
  @apply w-full py-3 px-6 rounded-lg font-semibold;
  @apply bg-primary text-white hover:bg-primary-dark;
  @apply transition-all duration-200 transform hover:scale-105;
  @apply shadow-lg hover:shadow-xl;
}

.restart-button:hover {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.4);
}
</style>
