<template>
  <div class="bubble-canvas-wrapper">
    <BubbleCanvas
      :currentYear="currentYear"
      :startYear="startYear"
      :endYear="endYear"
      @update:currentYear="currentYear = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BubbleCanvas from './BubbleCanvas.vue'
import { useBubbleStore } from '../../../entities/bubble/model/bubble-store'

const bubbleStore = useBubbleStore()

// Константы для временной шкалы
const startYear = 2010
const endYear = 2025
const currentYear = ref(startYear)

onMounted(() => {
  // Удалить все строки с console.log(...)
})
</script>

<style scoped>
.bubble-canvas-wrapper {
  @apply w-full h-full relative;
}
</style> 