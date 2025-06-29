<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="bg-surface border border-border rounded-2xl p-8 max-w-md w-full mx-4 text-center">
      <!-- Иконка черепа или крестика -->
      <div class="mb-6">
        <div class="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
      </div>

      <!-- Заголовок -->
      <h2 class="text-2xl font-bold text-text-primary mb-4">
        Game Over
      </h2>

      <!-- Основное сообщение -->
      <p class="text-text-secondary mb-6 leading-relaxed">
        К сожалению, мы с вами не сработаемся. 
        <br>
        Но не расстраивайтесь - каждая неудача делает нас сильнее!
      </p>

      <!-- Статистика -->
      <div class="bg-background/50 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-text-muted">Набрано XP</div>
            <div class="text-text-primary font-semibold">{{ currentXP }}</div>
          </div>
          <div>
            <div class="text-text-muted">Достигнут уровень</div>
            <div class="text-text-primary font-semibold">{{ currentLevel }}</div>
          </div>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="flex flex-col gap-3">
        <button
          @click="$emit('restart')"
          class="px-6 py-3 bg-primary text-white rounded-lg font-medium
                 hover:bg-primary-dark transition-colors duration-200
                 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          🔄 Начать заново с {{ restartYear }} года
        </button>
        
        <button
          @click="$emit('close')"
          class="px-6 py-2 text-text-secondary hover:text-text-primary
                 transition-colors duration-200"
        >
          Просмотреть результаты
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GAME_CONFIG } from '../../config/game-config'

interface Props {
  isOpen: boolean
  currentXP: number
  currentLevel: number
}

defineProps<Props>()

defineEmits<{
  close: []
  restart: []
}>()

const restartYear = GAME_CONFIG.RESTART_YEAR
</script>

<style scoped>
/* Дополнительные стили если нужны */
</style> 