<template>
  <div class="timeline-slider" ref="timelineRef" v-if="currentYear && !bubbleStore.isLoading">
    <div class="timeline-content">
      <div class="timeline-header">
        <div class="timeline-title-wrapper">
          <h3 class="text-text-primary whitespace-nowrap">{{ t('navigation.timeTravel') }}</h3>
          <ToolTip :text="t('navigation.timeTravelTooltip')" position="top">
            <div class="help-icon">
              <span class="help-icon-emoji">?</span>
            </div>
          </ToolTip>
        </div>

        <!-- Компактные кнопки навигации -->
        <div class="navigation-compact">
          <button
            @click="previousYear"
            class="nav-button prev-button"
            :disabled="currentYear <= startYear"
            :title="t('navigation.previousYear')"
          >
            <svg class="nav-icon-compact" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div class="year-display">
            <div class="year-wrapper">
              <span class="year-compact">{{ currentYear }}</span>
            </div>
          </div>

          <button
            @click="nextYear"
            class="nav-button next-button"
            :disabled="currentYear >= endYear"
            :title="t('navigation.nextYear')"
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


  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useBubbleStore } from '@/stores/bubble.store'
import { useSessionStore } from '@/stores/session.store'
import { createShakeAnimation, createYearChangeAnimation } from '@/utils'
import ToolTip from '@/ui/global/ToolTip.vue'

import { useI18n } from '@/composables'


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
const bubbleStore = useBubbleStore()
const sessionStore = useSessionStore()

// Ref для анимации shake эффекта
const timelineRef = ref<HTMLElement | null>(null)
const isAutoSwitching = ref(false) // Флаг для предотвращения повторных переключений

const handleYearChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newYear = parseInt(target.value)

  // Устанавливаем флаг ручного изменения года
  isAutoSwitching.value = true

  // Анимируем смену года
  requestAnimationFrame(() => {
    emit('update:currentYear', newYear)

    // Сбрасываем флаг через небольшую задержку
    setTimeout(() => {
      isAutoSwitching.value = false
    }, 1000)
  })
}

const previousYear = () => {
  if (props.currentYear > props.startYear) {
    // Устанавливаем флаг ручного изменения года
    isAutoSwitching.value = true

    requestAnimationFrame(() => {
      emit('update:currentYear', props.currentYear - 1)

      // Сбрасываем флаг через небольшую задержку
      setTimeout(() => {
        isAutoSwitching.value = false
      }, 1000)
    })
  }
}

const nextYear = () => {
  if (props.currentYear < props.endYear) {
    // Устанавливаем флаг ручного изменения года
    isAutoSwitching.value = true

    // Используем GSAP версию shake эффекта
    triggerGsapShakeEffect()

    requestAnimationFrame(() => {
      emit('update:currentYear', props.currentYear + 1)

      // Сбрасываем флаг через небольшую задержку
      setTimeout(() => {
        isAutoSwitching.value = false
      }, 1000)
    })
  }
}

// 🚀 GSAP альтернатива для анимации shake (более мощная)
const triggerGsapShakeEffect = () => {
  if (timelineRef.value) {
    createShakeAnimation(timelineRef.value)
  }
}

// 🎨 GSAP анимация для смены года (более крутая чем CSS)
const animateYearChangeWithGsap = (yearElement: HTMLElement) => {
  return createYearChangeAnimation(yearElement)
}

// Debounce функция для предотвращения множественных срабатываний
let autoSwitchTimeout: number | null = null


// Добавляем watch для анимации смены года
watch(() => props.currentYear, async () => {
  await nextTick()
  const yearElement = document.querySelector('.year-compact') as HTMLElement
  if (yearElement) {
    animateYearChangeWithGsap(yearElement)
  }
})

watch(() => props.currentYear, () => {
  if (autoSwitchTimeout) {
    clearTimeout(autoSwitchTimeout)
    autoSwitchTimeout = null
  }
  // Небольшая задержка перед сбросом флага
  setTimeout(() => {
    isAutoSwitching.value = false
  }, 100)
})

const { t } = useI18n()
</script>

<style scoped>
.timeline-slider {
  @apply w-full;
  @apply absolute bottom-4 left-1/2 transform -translate-x-1/2;
  @apply bg-background-glass backdrop-blur-md rounded-lg;
  @apply border border-border p-2 sm:p-3;
  width: calc(100vw - 6rem);
  max-width: 400px;
}

.timeline-content {
  @apply w-full transition-all duration-300;
}

.timeline-header {
  @apply flex justify-between items-center mb-2;
}

.timeline-title-wrapper {
  @apply flex items-center gap-2;
}

.timeline-header h3 {
  @apply text-xs sm:text-sm font-medium text-text-primary whitespace-nowrap;
}

.help-icon {
  @apply w-4 h-4 rounded-full border border-border;
  @apply flex items-center justify-center cursor-help;
  @apply transition-all duration-200 hover:bg-background-card hover:scale-110;
}

.help-icon-emoji {
  @apply text-xs text-text-muted;
}

.navigation-compact {
  @apply flex items-center gap-0.5;
}

.nav-button-compact {
  @apply w-5 h-5 flex items-center justify-center rounded
         bg-background-secondary hover:bg-background-card
         disabled:opacity-30 disabled:cursor-not-allowed
         transition-all duration-150 hover:scale-105;
}

.nav-button-compact:hover:not(:disabled) {
  @apply bg-primary text-white;
}

.nav-icon-compact {
  @apply w-2.5 h-2.5;
}

.year-display {
  @apply relative w-12 h-5 overflow-hidden;
}

.year-wrapper {
  @apply absolute inset-0 flex items-center justify-center;
}

.year-compact {
  @apply text-xs font-medium px-1 text-center absolute;
  color: #6b7280; /* text-text-secondary */
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slider-container {
  @apply space-y-2;
}

.slider-with-labels {
  @apply flex items-center gap-2;
}

.year-label-side {
  @apply text-xs text-text-muted font-medium min-w-8 text-center;
}

.year-slider {
  @apply flex-1 h-1.5 bg-background-secondary rounded-lg appearance-none cursor-pointer;
}

.year-slider::-webkit-slider-thumb {
  @apply appearance-none w-3 h-3 bg-primary rounded-full cursor-pointer;
}


</style>
