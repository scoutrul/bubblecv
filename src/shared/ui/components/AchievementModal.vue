<template>
  <BaseModal
    :is-open="modalStore.isAchievementModalOpen"
    data-testid="achievement-modal"
    @close="handleClose"
    class-name="achievement-modal-container"
  >
    <!-- Фиксированный хедер с крестиком -->
    <div class="relative flex-shrink-0 p-4 border-b border-amber-200">
      <button 
        @click="handleClose"
        class="close-button"
        aria-label="Закрыть"
        data-testid="achievement-continue"
      >
        ×
      </button>
      
      <!-- Заголовок в хедере -->
      <div class="text-center">
        <h2 class="text-lg font-bold text-amber-800 tracking-wider uppercase">
          Достижение разблокировано!
        </h2>
      </div>
    </div>
    
    <!-- Скроллируемая область контента -->
    <div 
      ref="scrollContainer"
      class="flex-1 overflow-y-auto scrollable-content"
      tabindex="0"
    >
      <!-- Фоновые эффекты -->
      <div class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-0 right-0 w-24 h-24 bg-yellow-200/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <!-- Содержимое с отступом для скроллбара -->
      <div class="relative z-10 text-center p-6 pr-4">
        <!-- Иконка достижения -->
        <div class="mb-6">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-lg animate-bounce">
            <span class="text-4xl">{{ modalStore.achievementData?.icon || '🏆' }}</span>
          </div>
        </div>
        
        <!-- Название достижения -->
        <h3 class="text-2xl font-bold text-gray-800 mb-4">
          {{ modalStore.achievementData?.title }}
        </h3>
        
        <!-- Описание -->
        <p class="text-gray-700 mb-6 leading-relaxed">
          {{ modalStore.achievementData?.description }}
        </p>
        
        <!-- XP награда -->
        <div class="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg mb-6">
          <div class="flex items-center justify-center space-x-2">
            <span class="text-2xl">✨</span>
            <span class="font-bold text-lg">+{{ modalStore.achievementData?.xpReward }} XP</span>
            <span class="text-2xl">✨</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Декоративные звезды (привязаны к основному контейнеру) -->
    <div class="absolute top-16 right-4 text-amber-400 animate-pulse pointer-events-none">⭐</div>
    <div class="absolute top-20 left-4 text-yellow-400 animate-pulse delay-500 pointer-events-none">🌟</div>
    <div class="absolute bottom-6 left-8 text-amber-300 animate-pulse delay-1000 pointer-events-none">✨</div>
    <div class="absolute bottom-4 right-6 text-yellow-300 animate-pulse delay-700 pointer-events-none">💫</div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useModalStore } from '@shared/stores/modal-store'
import BaseModal from './BaseModal.vue'

const modalStore = useModalStore()
const scrollContainer = ref<HTMLElement>()

// Автофокус на скроллируемую область при открытии модалки
watch(() => modalStore.isAchievementModalOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    scrollContainer.value?.focus()
  }
})

const handleClose = () => {
  modalStore.closeAchievementModal()
}
</script>

<style scoped>
.close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  color: #92400e;
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
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

.scrollable-content:focus {
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.3);
}

/* Кастомные стили для скроллбара WebKit */
.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: rgba(245, 158, 11, 0.1);
  border-radius: 4px;
  margin: 8px 0;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(245, 158, 11, 0.4);
  border-radius: 4px;
  border: 1px solid rgba(245, 158, 11, 0.1);
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 158, 11, 0.6);
}

.scrollable-content::-webkit-scrollbar-thumb:active {
  background: rgba(245, 158, 11, 0.8);
}

/* Стили для контейнера */
:deep(.achievement-modal-container) {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 2px solid #f59e0b;
}
</style> 