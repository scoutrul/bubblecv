<template>
  <div class="level-display">
    <div class="level-info" :class="[levelClass, { 'util-shake-hud': isShaking }]">
      <span class="level-title-group">
        <span class="level-icon">{{ levelIcon }}</span>
        <span :class="titleClass">Уровень {{ currentLevel }}</span>
      </span>
      <span :class="subtitleClass">{{ levelTitle }}</span>
      <div v-if="currentLevel >= 1" class="glossy-shine"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { gsap } from 'gsap'

interface Props {
  currentLevel: number
  levelTitle: string
  isShaking: boolean
}

const props = defineProps<Props>()

// Анимация глянцевого эффекта
const startShineAnimation = () => {
  gsap.killTweensOf('.glossy-shine')
  if (props.currentLevel >= 1) {
    gsap.fromTo('.glossy-shine', 
      { x: '-100%' },
      {
        x: '100%',
        duration: 1,
        ease: 'power1.out',
        repeat: -1,
        repeatDelay: 2
      }
    )
  }
}

watch(() => props.currentLevel, startShineAnimation, { immediate: true })

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
    110deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.2) 40%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0.2) 60%,
    rgba(255, 255, 255, 0.05) 75%,
    transparent 100%
  );
  transform: translateX(-100%);
  width: 100%;
  height: 100%;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
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