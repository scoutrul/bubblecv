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
        
        <span class="year-compact">{{ currentYear }}</span>
        
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

const handleYearChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:currentYear', parseInt(target.value))
}

const goToPreviousYear = () => {
  if (props.currentYear > props.startYear) {
    emit('update:currentYear', props.currentYear - 1)
  }
}

const goToNextYear = () => {
  if (props.currentYear < props.endYear) {
    emit('update:currentYear', props.currentYear + 1)
  }
}
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

.year-compact {
  @apply text-sm font-medium text-text-secondary px-2 min-w-[3rem] text-center;
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