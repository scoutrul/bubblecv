<template>
  <div class="toggle-button-widget">
    <div 
      class="toggle-button-container"
      @click="handleToggle"
    >
      <div class="button-container">
        <button 
          ref="toggleButton"
          class="toggle-button"
          :class="{ 'util-shake-hud': isShaking }"
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
import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { createShineAnimation, stopShineAnimation } from '@/utils/animations'

interface Props {
  icon: string
  badgeCount: number
  isShaking?: boolean
  position: 'bottom-right' | 'center-right'
  panelPosition?: 'bottom' | 'left'
}

interface Emits {
  (e: 'toggle'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  isShaking: false,
  panelPosition: 'bottom'
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

/* Позиции виджета */
.toggle-button-widget.bottom-right {
  @apply fixed bottom-4 right-2 sm:right-4 z-50;
}

.toggle-button-widget.center-right {
  @apply fixed right-4 top-1/2 transform -translate-y-1/2 z-50;
}

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
  @apply w-4 h-4 sm:w-5 sm:h-5 rounded-full;
  @apply text-xs font-bold text-white;
  @apply flex items-center justify-center;
  @apply border border-background-secondary sm:border-2;
  @apply z-20;
  background: var(--accent, #8b5cf6);
  min-width: 1rem;
}

@media (max-width: 640px) {
  .toggle-button-widget.center-right {
    @apply right-2;
  }
  
  .toggle-button {
    @apply w-6 h-6 text-base;
  }
  
  .notification-badge {
    @apply w-3 h-3 text-xs;
    min-width: 0.75rem;
  }
}

/* Панель позиции */
.panel-wrapper.bottom {
  @apply absolute bottom-full right-0 mb-4;
  @apply w-72 sm:w-80;
  @apply z-[10000];
  max-height: calc(100vh - 8rem);
  min-height: fit-content;
}

.panel-wrapper.left {
  @apply absolute right-16 top-0 w-80 max-w-[90vw];
  @apply z-[10000];
}

@media (max-width: 639px) {
  .panel-wrapper.left {
    @apply right-12 w-72;
  }
}

@media (max-width: 359px) {
  .panel-wrapper.left {
    @apply right-10 w-64;
  }
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
  transform: translateX(100%);
}

.slide-panel-leave-to.left {
  opacity: 0;
  transform: translateX(100%);
}
</style> 