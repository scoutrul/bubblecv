<template>
  <div class="timeline-slider">
    <div class="timeline-header">
      <h3 class="text-lg font-semibold">Путешествие во времени</h3>
      <span class="text-sm text-text-secondary">{{ currentYear }}</span>
    </div>
    
    <div class="slider-container">
      <input
        :value="currentYear"
        @input="handleYearChange"
        type="range"
        :min="startYear"
        :max="endYear"
        class="year-slider"
      />
      
      <div class="year-labels">
        <span class="text-xs">{{ startYear }}</span>
        <span class="text-xs">{{ endYear }}</span>
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
</script>

<style scoped>
.timeline-slider {
  @apply w-full;
}

.timeline-header {
  @apply flex justify-between items-center mb-4;
}

.slider-container {
  @apply space-y-2;
}

.year-slider {
  @apply w-full h-2 bg-background-secondary rounded-lg appearance-none cursor-pointer;
}

.year-slider::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-primary rounded-full cursor-pointer;
}

.year-slider::-moz-range-thumb {
  @apply w-4 h-4 bg-primary rounded-full cursor-pointer border-none;
}

.year-labels {
  @apply flex justify-between text-text-muted;
}
</style> 