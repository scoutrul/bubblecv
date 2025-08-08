<template>
  <div 
    ref="tooltipRef"
    class="tooltip-wrapper group"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <slot />
    <div 
      v-if="text"
      class="tooltip"
      :class="[
        `tooltip--${position}`,
        { 'tooltip--visible': isVisible }
      ]"
    >
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  text: string
  position?: 'left' | 'right' | 'top' | 'bottom'
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'right',
  delay: 100
})

const isVisible = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
let timeoutId: number | null = null

const showTooltip = () => {
  timeoutId = window.setTimeout(() => {
    isVisible.value = true
  }, props.delay)
}

const hideTooltip = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  isVisible.value = false
}

const handleClickOutside = (event: Event) => {
  if (tooltipRef.value && !tooltipRef.value.contains(event.target as Node)) {
    hideTooltip()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tooltip-wrapper {
  @apply relative;
}

.tooltip {
  @apply absolute px-3 py-1.5;
  @apply bg-background-secondary border border-border rounded-lg shadow-lg;
  @apply text-sm text-text-primary;
  @apply opacity-0 transition-opacity duration-300 pointer-events-none;
  @apply z-[99999];
  max-width: 240px;
  width: max-content;
  height: fit-content;
  /* Центрирование по вертикали */
  top: 50%;
  transform: translateY(-50%);
}

.tooltip--visible {
  @apply opacity-100;
}

/* Позиционирование справа (по умолчанию) */
.tooltip--right {
  @apply left-full ml-4;
}

/* Позиционирование слева */
.tooltip--left {
  @apply right-full mr-4;
}

/* Позиционирование сверху */
.tooltip--top {
  @apply bottom-full;
  /* Центрирование по горизонтали */
  left: 50%;
  transform: translateX(-50%) translateY(calc(-100% - 1rem));
}

/* Позиционирование снизу */
.tooltip--bottom {
  @apply top-full mt-4;
  /* Центрирование по горизонтали */
  left: 50%;
  transform: translateX(-50%) translateY(calc(100% + 1rem));
}

/* Адаптивность для мобильных устройств */
@media (max-width: 640px) {
  .tooltip {
    @apply text-xs px-2 py-1;
  }
  
  .tooltip--right {
    @apply ml-2;
  }
  
  .tooltip--left {
    @apply mr-2;
  }
  
  .tooltip--top {
    @apply mb-2;
  }
  
  .tooltip--bottom {
    @apply mt-2;
  }
}
</style> 