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
import BubbleCanvas from './BubbleCanvas.vue'
import { GAME_CONFIG } from '@shared/config/game-config'

const startYear = GAME_CONFIG.startYear
const endYear = GAME_CONFIG.endYear
const currentYear = GAME_CONFIG.startYear

</script>

<style scoped>
.bubble-canvas-wrapper {
  @apply w-full h-full relative;
}
</style> 