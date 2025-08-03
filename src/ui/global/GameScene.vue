<template>
  <div class="game-scene">
    <TimelineSlider :currentYear="currentYear" :start-year="startYear" :end-year="endYear"
      @update:currentYear="updateCurrentYear" class="timeline" />
    <GameHUD class="game-hud" />
    <BubbleCanvas class="bubble-scene" />

    <!-- Анимация смены года -->
    <YearTransition
      :year="currentYear"
    />

    <!-- Монитор производительности -->
    <PerformanceMonitor />
  </div>
</template>

<script setup lang="ts">
import BubbleCanvas from '@/ui/global/BubbleCanvas.vue'
import ResetButton from '@/ui/global/ResetButton.vue'
import GameHUD from '@/ui/hud/GameHUD.vue'
import TimelineSlider from '@/ui/timeline/TimelineSlider.vue'
import YearTransition from '@/ui/global/YearTransition.vue'
import PerformanceMonitor from '@/ui/global/PerformanceMonitor.vue'

import { useApp } from '@/composables'

const {
  resetGame,
  game: { startYear, endYear, currentYear, updateCurrentYear }
} = useApp()
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

.reset-button {
  z-index: 1000;
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 559px) {
  .timeline {
    /* Делаем TimelineSlider более компактным на мобильных */
    z-index: 900;
  }

  .reset-button {
    /* Перемещаем кнопку сброса в левый нижний угол на мобильных */
    z-index: 900;
  }
}

/* Очень узкие экраны (320px) */
@media (max-width: 359px) {
  .timeline {
    /* Дополнительная компактность для очень узких экранов */
    z-index: 900;
  }
}
</style>
