<template>
  <div 
    v-if="visible"
    class="year-transition"
  >
    <div ref="yearTextRef" class="year-text">
      {{ year }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { createYearTransitionAnimation } from '@/utils/animations'

interface Props {
  year: number
}

const props = defineProps<Props>()

const visible = ref(false)
const yearTextRef = ref<HTMLElement | null>(null)

const animateYear = async () => {
  visible.value = true
  await nextTick()
  
  if (!yearTextRef.value) return
  
  // Используем GSAP анимацию
  createYearTransitionAnimation(yearTextRef.value, () => {
    visible.value = false
  })
}

// Анимация при смене года
watch(() => props.year, (newYear, oldYear) => {
  if (newYear && oldYear && newYear !== oldYear) {
    animateYear()
  }
}, { immediate: false })
</script>

<style scoped>
.year-transition {
  @apply fixed inset-0 flex items-center justify-center pointer-events-none;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
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