<template>
  <div class="timeline-slider">
    <div class="timeline-header">
      <h3 class="text-lg font-semibold">Путешествие во времени</h3>
      
      <!-- Компактные кнопки навигации -->
      <div class="navigation-compact">
        <button 
          @click="goToPreviousYear" 
          :disabled="currentYear <= startYear"
          class="nav-button-compact"
          title="Предыдущий год"
        >
          <svg class="nav-icon-compact" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div class="year-display">
          <TransitionGroup name="slide" tag="div" class="year-wrapper">
            <span :key="currentYear" class="year-compact">{{ currentYear }}</span>
          </TransitionGroup>
        </div>
        
        <button 
          @click="goToNextYear" 
          :disabled="currentYear >= endYear"
          class="nav-button-compact"
          title="Следующий год"
        >
          <svg class="nav-icon-compact" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="slider-container">
      <div class="slider-with-labels">
        <span class="year-label-side">{{ startYear }}</span>
        
        <input
          :value="currentYear"
          @input="handleYearChange"
          type="range"
          :min="startYear"
          :max="endYear"
          class="year-slider"
        />
        
        <span class="year-label-side">{{ endYear }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useBubbleStore } from '../../../entities/bubble/model/bubble-store'

interface Props {
  currentYear: number
  startYear: number
  endYear: number
}

interface Emits {
  (e: 'update:currentYear', year: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const bubbleStore = useBubbleStore()

const handleYearChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newYear = parseInt(target.value)
  
  // Анимируем смену года
  requestAnimationFrame(() => {
    emit('update:currentYear', newYear)
  })
}

const goToPreviousYear = () => {
  if (props.currentYear > props.startYear) {
    requestAnimationFrame(() => {
      emit('update:currentYear', props.currentYear - 1)
    })
  }
}

const goToNextYear = () => {
  if (props.currentYear < props.endYear) {
    requestAnimationFrame(() => {
      emit('update:currentYear', props.currentYear + 1)
    })
  }
}

// Улучшенная логика автопереключения
watch(
  () => bubbleStore.getBubblesByYear(props.currentYear),
  (currentBubbles) => {
    // Проверяем есть ли непосещенные пузыри
    const unvisitedBubbles = currentBubbles.filter(bubble => !bubble.isVisited)
    
    // Если все пузыри посещены или их нет, переходим к следующему году
    if ((currentBubbles.length === 0 || unvisitedBubbles.length === 0) && props.currentYear < props.endYear) {
      // Добавляем небольшую задержку для плавности
      setTimeout(() => {
        goToNextYear()
      }, 500)
    }
  },
  { immediate: true } // Проверяем сразу при монтировании
)
</script>

<style scoped>
.timeline-slider {
  @apply w-full;
}

.timeline-header {
  @apply flex justify-between items-center mb-4;
}

.navigation-compact {
  @apply flex items-center gap-1;
}

.nav-button-compact {
  @apply w-6 h-6 flex items-center justify-center rounded 
         bg-background-secondary hover:bg-background-card 
         disabled:opacity-30 disabled:cursor-not-allowed
         transition-all duration-150 hover:scale-105;
}

.nav-button-compact:hover:not(:disabled) {
  @apply bg-primary text-white;
}

.nav-icon-compact {
  @apply w-3 h-3;
}

.year-display {
  @apply relative w-[4rem] h-[1.5rem] overflow-hidden;
}

.year-wrapper {
  @apply absolute inset-0 flex items-center justify-center;
}

.year-compact {
  @apply text-sm font-medium text-text-secondary px-2 text-center absolute;
}

/* Анимации для TransitionGroup */
.slide-move,
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-leave-active {
  position: absolute;
}

.slider-container {
  @apply space-y-2;
}

.slider-with-labels {
  @apply flex items-center gap-3;
}

.year-label-side {
  @apply text-xs text-text-muted font-medium min-w-[2.5rem] text-center;
}

.year-slider {
  @apply flex-1 h-2 bg-background-secondary rounded-lg appearance-none cursor-pointer;
}

.year-slider::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-primary rounded-full cursor-pointer;
}

.year-slider::-moz-range-thumb {
  @apply w-4 h-4 bg-primary rounded-full cursor-pointer border-none;
}
</style> 