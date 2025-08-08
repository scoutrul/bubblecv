<template>
  <div class="game-scene">
    <!-- Канвас вне влияния шейк-эффекта -->
    <BubbleCanvas class="bubble-scene" />
    
    <!-- UI элементы с шейк-эффектом -->
    <div class="ui-layer" :class="{ 'util-shake-game-scene': isGameSceneShaking }">
      <!-- Виджеты в верхней правой части экрана -->
      <div class="right-top-widgets-container">
        <CategoryFilterWidget />
      </div>

      <!-- Виджеты настроек и сброса - размещаем выше таймлайна -->
      <div class="left-widgets-container">
        <SettingsWidget />
        <LanguageWidget />
        <ResetButton @handle-reset="resetGame" />
      </div>

      <TimelineSlider :currentYear="currentYear" :start-year="startYear" :end-year="endYear"
        @update:currentYear="updateCurrentYear" class="timeline" />
      <GameHUD class="game-hud" />

      <!-- Анимация смены года -->
      <YearTransition
        :year="currentYear"
      />

      <!-- Монитор производительности -->
      <PerformanceMonitor />
    </div>
  </div>
</template>

<script setup lang="ts">
import BubbleCanvas from '@/ui/shared/BubbleCanvas.vue'
import ResetButton from '@/ui/widgets/misc/ResetButton.vue'
import LanguageWidget from '@/ui/widgets/language/LanguageWidget.vue'
import GameHUD from '@/ui/hud/GameHUD.vue'
import TimelineSlider from '@/ui/hud/TimelineSlider.vue'
import YearTransition from '@/ui/shared/YearTransition.vue'
import PerformanceMonitor from '@/ui/widgets/performance/PerformanceMonitor.vue'
import SettingsWidget from '@/ui/widgets/performance/SettingsWidget.vue'
import CategoryFilterWidget from '@/ui/widgets/category-filter/CategoryFilterWidget.vue'

import { computed } from 'vue'
import { useApp } from '@/composables'
import { useUiEventStore } from '@/stores'

const {
  resetGame,
  game: { startYear, endYear, currentYear, updateCurrentYear }
} = useApp()

const uiEventStore = useUiEventStore()

const isGameSceneShaking = computed(() => uiEventStore.gameSceneShake)
</script>

<style scoped>
.game-scene {
  @apply relative w-full h-full;
  pointer-events: auto;
}

.bubble-scene {
  @apply absolute inset-0;
  z-index: 1;
}

.ui-layer {
  @apply absolute inset-0;
  z-index: 10;
  pointer-events: none;
}

.timeline {
  @apply pointer-events-auto;
  z-index: 1;
}

.game-hud {
  @apply absolute top-0 right-0 z-10 pointer-events-none;
}

/* Верхний правый контейнер виджетов */
.right-top-widgets-container {
  @apply fixed top-16 right-2 sm:right-4;
  @apply flex flex-col gap-4;
  @apply pointer-events-auto;
  z-index: 10000;
}

/* Левый контейнер виджетов - высокий приоритет */
.left-widgets-container {
  @apply fixed bottom-4 left-2 sm:left-4;
  @apply flex flex-col gap-4;
  @apply pointer-events-auto;
  z-index: 10000;
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