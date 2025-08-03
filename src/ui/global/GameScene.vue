<template>
  <div class="game-scene">
    <!-- Виджеты настроек и сброса - размещаем выше таймлайна -->
    <div class="left-widgets-container">
      <SettingsWidget :is-shaking="isSettingsShaking" />
      <ResetButton @handle-reset="resetGame" />
    </div>

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
import SettingsWidget from '@/ui/global/SettingsWidget.vue'

import { computed } from 'vue'
import { useApp, useUi } from '@/composables'

const {
  resetGame,
  game: { startYear, endYear, currentYear, updateCurrentYear }
} = useApp()

const { shakingComponents } = useUi()

const isSettingsShaking = computed(() => shakingComponents.value.has('settings'))
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

/* Левый контейнер виджетов - высокий приоритет */
.left-widgets-container {
  @apply fixed bottom-4 left-2 sm:left-4;
  @apply flex flex-col gap-4;
  z-index: 10000;
  pointer-events: auto;
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 559px) {
  .timeline {
    /* Делаем TimelineSlider более компактным на мобильных */
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
