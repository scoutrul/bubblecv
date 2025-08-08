<template>
  <div class="toggle-button-widget" :class="{ 'toggle-button-widget--grey': !badgeCount}">
    <div
      class="toggle-button-container"
      @click="handleToggle"
    >
      <div class="button-container" :class="{ 'button-container--transparent': transparent }">
        <button
          ref="toggleButton"
          class="toggle-button"
          :class="{ 'toggle-button--transparent': transparent }"
        >
          {{ icon }}
        </button>
        <div class="shine-overlay" v-if="badgeCount > 0"></div>
      </div>

      <!-- Уведомление о новых элементах -->
      <div v-if="badgeCount > 0" class="notification-badge">
        {{ badgeCount }}
      </div>
    </div>

    <!-- Панель -->
    <Transition name="slide-panel">
      <div
        v-if="isPanelOpen"
        class="panel-wrapper"
        :class="panelPosition"
      >
        <slot name="panel" :close="closePanel" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { createShineAnimation, stopShineAnimation } from '@/utils'
import { onMounted, onUnmounted, ref, watch } from 'vue'

interface Props {
  icon: string
  badgeCount: number
  position: 'bottom-right' | 'center-right'
  panelPosition?: 'bottom' | 'left' | 'right'
  transparent?: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'close'): void
}

// Типизация слотов компонента
defineSlots<{
  panel(props: { close: () => void }): any
}>()

const props = withDefaults(defineProps<Props>(), {
  panelPosition: 'bottom',
  transparent: false
})

const emit = defineEmits<Emits>()

const isPanelOpen = ref(false)
const toggleButton = ref<HTMLElement | null>(null)
let shineAnimationActive = false

const handleToggle = () => {
  isPanelOpen.value = !isPanelOpen.value
  emit('toggle')
}

const closePanel = () => {
  isPanelOpen.value = false
  emit('close')
}

// Shine animation logic
const startShineAnimation = () => {
  if (props.badgeCount > 0 && !shineAnimationActive) {
    const randomDelay = Math.random() * 3000

    setTimeout(() => {
      if (props.badgeCount > 0) {
        createShineAnimation('.button-container .shine-overlay', {
          duration: 1.5,
          repeatDelay: 4 + Math.random() * 2,
          ease: 'power2.out'
        })
        shineAnimationActive = true
      }
    }, randomDelay)
  }
}

const stopShineAnimationIfNeeded = () => {
  if (shineAnimationActive) {
    stopShineAnimation('.button-container .shine-overlay')
    shineAnimationActive = false
  }
}

watch(() => props.badgeCount, (newCount: number) => {
  if (newCount > 0) {
    startShineAnimation()
  } else {
    stopShineAnimationIfNeeded()
  }
})

onMounted(() => {
  if (props.badgeCount > 0) {
    startShineAnimation()
  }
})

onUnmounted(() => {
  stopShineAnimationIfNeeded()
})
</script>

<style scoped>
.toggle-button-widget {
  @apply relative;
}

.toggle-button-widget--grey {
  @apply filter grayscale;
}

.button-container {
  @apply shadow-md shadow-background-card/50;
  @apply transition-all duration-300;
}

/* Прозрачная версия контейнера — убираем тени и на hover */
.button-container--transparent {
  @apply shadow-none;
}
.button-container--transparent:hover {
  @apply shadow-none;
}

.button-container:hover {
  @apply shadow-xl shadow-background-card/100;
}

/* Позиции виджета */

.toggle-button-container {
  @apply relative;
  pointer-events: auto;
}

.button-container {
  @apply relative overflow-hidden rounded-full;
}

.toggle-button {
  @apply bg-background-secondary rounded-full;
  @apply flex items-center justify-center;
  @apply text-lg sm:text-2xl border-[0.5px] border-border;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-all duration-300;
  @apply hover:scale-110;
  @apply active:scale-95;
  @apply relative;
  @apply w-8 h-8 sm:w-12 sm:h-12;
  cursor: pointer;
}

/* Прозрачная версия кнопки */
.toggle-button--transparent {
  @apply bg-transparent border-0 shadow-none;
}

.toggle-button:hover {
  @apply shadow-xl shadow-primary/30;
}

.shine-overlay {
  @apply absolute inset-0 rounded-full;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  transform: translateX(-150%) skewX(-15deg);
  width: 200%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.notification-badge {
  @apply absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1;
  @apply w-6 h-6 rounded-full;
  @apply text-xs font-bold text-white;
  @apply flex items-center justify-center;
  @apply border border-background-secondary sm:border-2;
  @apply z-20;
  background: var(--accent);
  min-width: 1rem;
}

@media (max-width: 640px) {
  .toggle-button-widget.center-right {
    @apply right-2;
  }

  .toggle-button {
    @apply w-8 h-8 text-base;
  }

  .notification-badge {
    @apply w-4 h-4 text-xs;
    min-width: 0.75rem;
  }
}

/* Панель позиции */
.panel-wrapper.bottom {
  @apply absolute bottom-full right-0 mb-4;
  @apply w-72 sm:w-80;
  @apply z-[100000];
  max-height: calc(100vh - 8rem);
  min-height: fit-content;
}

.panel-wrapper.left {
  @apply absolute top-full left-0 mt-4;
  @apply w-72 sm:w-80;
  @apply z-[100000];
  max-height: calc(100vh - 8rem);
  min-height: fit-content;
}

.panel-wrapper.right {
  @apply absolute top-0 right-[4rem];
  @apply w-72 sm:w-80;
  @apply z-[100000];
  max-height: calc(100vh - 8rem);
  min-height: fit-content;
}

/* Анимации панели */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.3s ease-out;
}

.slide-panel-enter-from.bottom {
  opacity: 0;
  transform: translateY(10px);
}

.slide-panel-leave-to.bottom {
  opacity: 0;
  transform: translateY(10px);
}

.slide-panel-enter-from.left {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-panel-leave-to.left {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-panel-enter-from.right {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-panel-leave-to.right {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 