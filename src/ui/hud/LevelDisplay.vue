<template>
  <div class="level-display">
    <div class="level-info" :class="[levelClass, { 'util-shake-hud': isShaking }]">
      <span class="level-title-group">
        <span class="level-icon">{{ levelIcon }}</span>
        <span :class="titleClass">Уровень {{ currentLevel }}</span>
      </span>
      <span :class="subtitleClass">{{ levelTitle }}</span>
      <div v-if="currentLevel >= 3" class="glossy-shine"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

interface Props {
  currentLevel: number
  levelTitle: string
  isShaking: boolean
}

const props = defineProps<Props>()

// Анимация глянцевого эффекта
const startShineAnimation = () => {
  if (props.currentLevel >= 3) {
    gsap.to('.glossy-shine', {
      x: '150%',
      duration: 2,
      ease: 'power1.inOut',
      repeat: -1,
      repeatDelay: 3,
      onComplete: () => {
        gsap.set('.glossy-shine', { x: '-150%' })
      }
    })
  }
}

onMounted(() => {
  startShineAnimation()
})

onUnmounted(() => {
  gsap.killTweensOf('.glossy-shine')
})

const levelIcon = computed(() => {
  switch (props.currentLevel) {
    case 1: return '👋'
    case 2: return '🤔'
    case 3: return '📚'
    case 4: return '🤝'
    case 5: return '🤜🤛'
    default: return '⭐'
  }
})

const levelClass = computed(() => `level-${props.currentLevel}`)

const titleClass = computed(() => {
  switch (props.currentLevel) {
    case 1: return 'title-novice'
    case 2: return 'title-interested'
    case 3: return 'title-learning'
    case 4: return 'title-partner'
    case 5: return 'title-bro'
    default: return 'title-novice'
  }
})

const subtitleClass = computed(() => {
  switch (props.currentLevel) {
    case 1: return 'subtitle-novice'
    case 2: return 'subtitle-interested'
    case 3: return 'subtitle-learning'
    case 4: return 'subtitle-partner'
    case 5: return 'subtitle-bro'
    default: return 'subtitle-novice'
  }
})
</script>

<style scoped>
.level-display {
  @apply flex-shrink-0;
}

.level-info {
  @apply flex items-baseline gap-x-3 text-right p-2 rounded-lg transition-all duration-300 relative overflow-hidden;
}

.level-title-group {
  @apply flex items-center gap-1.5 text-sm font-semibold;
}

.level-icon {
  @apply text-base;
}

.glossy-shine {
  @apply absolute inset-0 pointer-events-none;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 45%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 55%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-150%);
}

/* --- Level 1 --- */
.title-novice { @apply text-text-muted; }
.subtitle-novice { @apply text-xs text-text-muted/80; }

/* --- Level 2 --- */
.level-2 { @apply bg-blue-900/30; }
.title-interested { @apply text-blue-300; }
.subtitle-interested { @apply text-xs text-blue-400; }

/* --- Level 3 --- */
.level-3 { @apply bg-green-900/30 border border-green-500/20; }
.title-learning { @apply text-green-300; }
.subtitle-learning { @apply text-xs text-green-400; }

/* --- Level 4 --- */
.level-4 { @apply bg-purple-900/40 border border-purple-500/20; }
.title-partner { @apply text-purple-300; }
.subtitle-partner { @apply text-xs text-purple-400; }

/* --- Level 5 --- */
.level-5 { @apply bg-amber-900/40 border border-amber-500/20; }
.title-bro { @apply text-amber-300; }
.subtitle-bro { @apply text-xs text-amber-400 font-semibold; }
</style>