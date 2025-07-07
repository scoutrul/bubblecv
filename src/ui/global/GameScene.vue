<template>
<div class="game-scene">
    <TimelineSlider 
        :currentYear="currentYear"
        :start-year="startYear"
        :end-year="endYear"
        @update:currentYear="updateCurrentYear"
        class="timeline"
    />
    <GameHUD class="game-hud" />
    <BubbleCanvas class="bubble-scene" />
    <ResetButton @handle-reset="resetGame"/>
</div>
</template>

<script setup lang="ts">
import BubbleCanvas from '@/ui/global/BubbleCanvas.vue'
import ResetButton from '@/ui/global/ResetButton.vue'
import GameHUD from '@/ui/hud/GameHUD.vue'
import TimelineSlider from '@/ui/timeline/TimelineSlider.vue'

import { useApp } from '@/composables'

const { 
  resetGame, 
  game: { startYear, endYear, currentYear, updateCurrentYear } } = useApp()

</script>

<style scoped>
.timeline {
  z-index: 1;
}

.bubble-scene {
  @apply absolute inset-0;
}

.game-hud {
  @apply absolute top-0 right-0 z-10;
}
</style>