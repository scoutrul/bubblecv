<template>
  <div 
    v-if="modalStore.isAchievementModalOpen" 
    class="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    @click.self="handleClose"
  >
    <div 
      class="relative bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl shadow-2xl border-2 border-amber-300 p-8 max-w-md w-full transform transition-all duration-300 scale-105"
      @click.stop
    >
      <!-- Фоновые эффекты -->
      <div class="absolute inset-0 rounded-2xl overflow-hidden">
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-0 right-0 w-24 h-24 bg-yellow-200/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <!-- Содержимое -->
      <div class="relative z-10 text-center">
        <!-- Иконка достижения -->
        <div class="mb-6">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-lg animate-bounce">
            <span class="text-4xl">{{ modalStore.achievementData?.icon || '🏆' }}</span>
          </div>
        </div>
        
        <!-- Заголовок "ДОСТИЖЕНИЕ" -->
        <div class="mb-4">
          <h2 class="text-lg font-bold text-amber-800 tracking-wider uppercase">
            Достижение разблокировано!
          </h2>
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
        
        <!-- Подсказка для закрытия -->
        <div class="text-amber-700 text-sm">
          Кликните вне окна для продолжения
        </div>
      </div>
      
      <!-- Декоративные звезды -->
      <div class="absolute top-4 right-4 text-amber-400 animate-pulse">⭐</div>
      <div class="absolute top-8 left-4 text-yellow-400 animate-pulse delay-500">🌟</div>
      <div class="absolute bottom-6 left-8 text-amber-300 animate-pulse delay-1000">✨</div>
      <div class="absolute bottom-4 right-6 text-yellow-300 animate-pulse delay-700">💫</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModalStore } from '@shared/stores/modal-store'

const modalStore = useModalStore()

const handleClose = () => {
  modalStore.closeAchievementModal()
}
</script>

<style scoped>
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeInScale {
  animation: fadeInScale 0.3s ease-out;
}
</style> 