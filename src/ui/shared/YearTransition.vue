<template>
  <div
    v-if="visible"
    class="year-transition"
    :class="{ dim: dimBackground }"
  >
    <div ref="yearTextRef" class="year-text">
      {{ displayText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch, computed } from 'vue'
import { createYearTransitionAnimation } from '@/utils'
import { gsap } from 'gsap'

interface Props {
  year: number
  text?: string
  animateOnMount?: boolean
  dimBackground?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  animateOnMount: false,
  dimBackground: false
})

const visible = ref(false)
const yearTextRef = ref<HTMLElement | null>(null)
const hasAnimatedOnce = ref(false)

const displayText = computed(() => {
  return props.text && props.text.length > 0 ? props.text : String(props.year)
})

const dimBackground = computed(() => props.dimBackground === true)

// Храним текущую анимацию, чтобы убивать предыдущую и избегать гонок завершений
const currentTimeline = ref<gsap.core.Timeline | null>(null)

const animateYear = async (direction: 'up' | 'down') => {
  visible.value = true
  await nextTick()

  if (!yearTextRef.value) return

  // Останавливаем предыдущие твины и таймлайн, если они ещё идут
  if (currentTimeline.value) {
    currentTimeline.value.kill()
    currentTimeline.value = null
  }
  gsap.killTweensOf(yearTextRef.value)

  // Запускаем новую анимацию и скрываем оверлей только если это актуальный таймлайн
  const tl = createYearTransitionAnimation(yearTextRef.value, direction, () => {
    if (currentTimeline.value === tl) {
      visible.value = false
      currentTimeline.value = null
    }
  })
  currentTimeline.value = tl
}

// Анимация при смене года
watch(() => props.year, (newYear, oldYear) => {
  if (newYear && oldYear && newYear !== oldYear) {
    const direction = newYear > oldYear ? 'down' : 'up'
    animateYear(direction)
    hasAnimatedOnce.value = true
  }
}, { immediate: false })

// Анимация при смене текста (отсчет/GO!)
watch(() => props.text, (newText, oldText) => {
  // Не анимируем на первом монтировании, если animateOnMount === false
  if (!props.animateOnMount && !hasAnimatedOnce.value && !oldText && newText) {
    hasAnimatedOnce.value = true
  }
  if (newText !== undefined && newText !== null && newText !== oldText) {
    animateYear('down')
    hasAnimatedOnce.value = true
  }
}, { immediate: false })
</script>

<style scoped>
.year-transition {
  @apply fixed inset-0 flex items-center justify-center pointer-events-none;
  z-index: 9999;
  background: transparent;
}

.year-transition.dim {
  background: rgba(0, 0, 0, 0.9);
}

.year-text {
  @apply text-8xl font-bold text-white;
  background: linear-gradient(45deg, #8b5cf6, #06b6d4, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
}
</style> 