<template>
<div class="game-scene">
    <GameHUD class="game-hud" />
    <BubbleCanvas class="bubble-scene" />
    <TimelineSlider 
        :currentYear="currentYear"
        :start-year="startYear"
        :end-year="endYear"
        @update:currentYear="sessionStore.updateCurrentYear"
        class="timeline"
    />
    <ResetButton />
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBubbleStore } from '@/stores/bubble.store'
import { useSessionStore } from '@/stores/session.store'

import GameHUD from '../hud/GameHUD.vue'
import BubbleCanvas from './BubbleCanvas.vue'
import TimelineSlider from '../timeline/TimelineSlider.vue'
import ResetButton from './ResetButton.vue'

import { getYearRange } from '@/utils/ui'

const sessionStore = useSessionStore()

const currentYear = computed(() => sessionStore.currentYear)
const bubbleStore = useBubbleStore()
const { startYear, endYear } = getYearRange(bubbleStore.bubbles)

</script>

<style scoped>
.bubble-scene {
  @apply absolute inset-0;
}

.game-hud {
  @apply absolute top-0 right-0 z-10;
}
</style>