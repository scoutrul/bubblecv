<template>
  <BaseModal
    :is-open="isOpen"
    :allow-escape-close="allowEscapeClose"
    :is-closing="isClosing"
    @close="$emit('close')"
    class-name="achievement-modal-container"
  >
    <!-- Фиксированный хедер с крестиком -->
    <div class="modal-header">
      <button
        @click="$emit('close')"
        class="close-button"
        aria-label="Закрыть"
      >
        ×
      </button>

      <!-- Заголовок в хедере -->
      <div class="header-title">
        <h2 class="header-text">
          Достижение разблокировано!
        </h2>
      </div>
    </div>

    <!-- Скроллируемая область контента -->
    <div
      class="scrollable-content"
      tabindex="0"
    >
      <!-- Фоновые эффекты -->
      <div class="background-effects">
        <div class="bg-effect-1"></div>
        <div class="bg-effect-2"></div>
      </div>

      <!-- Содержимое с отступом для скроллбара -->
      <div class="modal-content">
        <!-- Иконка достижения -->
        <div class="achievement-icon-container">
          <div class="achievement-icon">
            <span class="achievement-emoji">{{ achievement?.icon || '🏆' }}</span>
          </div>
        </div>

        <!-- Название достижения -->
        <h3 class="achievement-title">
          {{ achievement?.title }}
        </h3>

        <!-- Описание -->
        <p class="achievement-description">
          {{ achievement?.description }}
        </p>

        <!-- XP награда -->
        <div
          @click="$emit('close')"
          class="xp-reward-block"
        >
          <div class="xp-reward-content">
            <span class="xp-star">✨</span>
            <span class="xp-text">+{{ achievement?.xpReward }} XP</span>
            <span class="xp-star">✨</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Декоративные звезды (привязаны к основному контейнеру) -->
    <div class="decorative-star star-1">⭐</div>
    <div class="decorative-star star-2">🌟</div>
    <div class="decorative-star star-3">✨</div>
    <div class="decorative-star star-4">💫</div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/global/BaseModal.vue'
import type { PendingAchievement } from '@/types/modals'

interface Props {
  isClosing?: boolean
  isOpen: boolean
  achievement: PendingAchievement | null
  allowEscapeClose?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

</script>

<style scoped>
/* Стили для контейнера */
:deep(.achievement-modal-container) {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 2px solid #f59e0b;

  .modal-content {
    padding: 1rem;
    margin: 0;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    max-width: 480px
  }
}

.modal-header {
  @apply relative flex-shrink-0 p-4 border-b border-amber-200;
}

.header-title {
  @apply text-center;
}

.header-text {
  @apply text-lg font-bold text-amber-800 tracking-wider uppercase;
}

.background-effects {
  @apply absolute inset-0 rounded-2xl overflow-hidden pointer-events-none;
}

.bg-effect-1 {
  @apply absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl animate-pulse;
}

.bg-effect-2 {
  @apply absolute bottom-0 right-0 w-24 h-24 bg-yellow-200/40 rounded-full blur-2xl animate-pulse;
  animation-delay: 1000ms;
}

.modal-content {
  @apply relative z-10 text-center p-6 pr-4;
}

.achievement-icon-container {
  @apply my-2;
}

.achievement-icon {
  @apply inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-lg animate-bounce;
}

.achievement-emoji {
  @apply text-4xl;
}

.achievement-title {
  @apply text-2xl font-bold text-gray-800 mb-4;
}

.achievement-description {
  @apply text-gray-700 mb-6 leading-relaxed;
}

.xp-reward-content {
  @apply flex items-center justify-center space-x-2;
}

.xp-star {
  @apply text-2xl;
}

.xp-text {
  @apply font-bold text-lg;
}

.decorative-star {
  @apply absolute text-amber-400 animate-pulse pointer-events-none;
}

.star-1 {
  @apply top-16 right-4;
}

.star-2 {
  @apply top-20 left-4 text-yellow-400;
  animation-delay: 500ms;
}

.star-3 {
  @apply bottom-6 left-8 text-amber-300;
  animation-delay: 1000ms;
}

.star-4 {
  @apply bottom-4 right-6 text-yellow-300;
  animation-delay: 700ms;
}

.close-button {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 2rem;
  height: 2rem;
  color: #92400e;
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.close-button:hover {
  color: #78350f;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* Стили для скроллируемой области */
.scrollable-content {
  outline: none;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(245, 158, 11, 0.4) rgba(245, 158, 11, 0.1);
}

/* Стили для XP блока */
.xp-reward-block {
  @apply bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg mb-6 cursor-pointer transition-all duration-200;
}

.xp-reward-block:hover {
  @apply transform scale-105 shadow-xl;
  background: linear-gradient(to right, #22c55e, #059669);
}

.xp-reward-block:active {
  @apply transform scale-95;
}
</style>
