<template>
  <div class="game-scene">
    <!-- Канвас вне влияния шейк-эффекта -->
    <BubbleCanvas class="bubble-scene" />
    
    <!-- UI элементы с шейк-эффектом -->
    <div class="ui-layer" :class="{ 'util-shake-game-scene': isGameSceneShaking }">
      <!-- Виджеты в верхней правой части экрана -->
      <div class="right-top-widgets-container" v-if="!clickerActive">
        <CategoryFilterWidget />
      </div>

      <!-- Виджеты верхнего левого угла -->
      <div class="left-top-widgets-container">
        <ClickerWidget />
      </div>

      <!-- Виджеты настроек и сброса - размещаем выше таймлайна -->
      <div class="left-widgets-container" v-if="!clickerActive">
        <SettingsWidget />
        <LanguageWidget />
        <ResetButton @handle-reset="resetGame" />
      </div>

      <TimelineSlider v-if="!clickerActive" :currentYear="currentYear" :start-year="startYear" :end-year="endYear"
        @update:currentYear="updateCurrentYear" class="timeline" />
      <GameHUD v-if="!clickerActive" class="game-hud" />

      <!-- Анимация смены года и отсчёт кликера -->
      <YearTransition
        v-if="!clickerActive"
        :year="currentYear"
        :dimBackground="false"
      />
      <YearTransition
        v-if="countdownOverlayVisible"
        :year="0"
        :text="countdownText"
        :animateOnMount="false"
        :dimBackground="true"
      />

      <!-- Таймер кликера -->
      <div v-if="showClickerTimer" class="clicker-timer" :class="{ danger: isTimerDanger }">
        {{ timerText }}
      </div>

      <!-- Монитор производительности -->
      <PerformanceMonitor v-if="!clickerActive" />
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
import ClickerWidget from '@/ui/widgets/clicker/ClickerWidget.vue'

import { computed } from 'vue'
import { useApp } from '@/composables'
import { useUiEventStore } from '@/stores'
import { useClickerStore } from '@/stores/clicker.store'

const {
  resetGame,
  game: { startYear, endYear, currentYear, updateCurrentYear }
} = useApp()

const uiEventStore = useUiEventStore()
const clicker = useClickerStore()

const isGameSceneShaking = computed(() => uiEventStore.gameSceneShake)
const clickerActive = computed(() => clicker.isActive)
const showClickerTimer = computed(() => clicker.isRunning)

const timerText = computed(() => {
  const { minutes, seconds, tenths } = clicker.timeLeftSecTenths
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${mm}:${ss}.${tenths}`
})

const isTimerDanger = computed(() => clicker.timeLeftSecTenths.minutes === 0 && clicker.timeLeftSecTenths.seconds <= 10)

const countdownOverlayVisible = computed(() => clicker.isActive && !clicker.isRunning && clicker.countdown !== null)
const countdownText = computed(() => {
  if (clicker.countdown === null) return ''
  return clicker.countdown === 0 ? 'GO!' : String(clicker.countdown)
})
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

/* Верхний левый контейнер виджетов */
.left-top-widgets-container {
  @apply fixed top-16 left-2 sm:left-4;
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

/* Clicker timer */
.clicker-timer {
  @apply fixed top-4 right-4 text-2xl font-mono font-semibold px-3 py-1 rounded-md pointer-events-none;
  @apply bg-background-secondary/60 text-text-primary border border-border backdrop-blur-md;
  z-index: 10001;
}

.clicker-timer.danger {
  @apply text-red-500 border-red-500;
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