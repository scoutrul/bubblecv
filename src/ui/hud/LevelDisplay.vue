<template>
  <div class="level-display">
    <div 
      class="level-info" 
      :class="[levelClass, { 'util-shake-hud': isShaking, 'clickable': currentLevel >= 2 }]"
      @click="handleLevelClick"
    >
      <span class="level-title-group">
        <span class="level-icon">{{ levelIcon }}</span>
        <span :class="titleClass" class="mobile-text-xs whitespace-nowrap">Уровень {{ currentLevel }}</span>
      </span>
      <span :class="subtitleClass" class="mobile-text-xs whitespace-nowrap">{{ levelTitle }}</span>
      <div v-if="currentLevel >= 2" class="level-shine"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { createLevelShineAnimation, stopLevelShineAnimation } from '@/utils/animations'
import { useModals } from '@/composables/useModals'

interface Props {
  currentLevel: number
  levelTitle: string
  isShaking: boolean
}

const props = defineProps<Props>()

const { openLevelUpModal } = useModals()

const handleLevelClick = () => {
  if (props.currentLevel >= 2) {
    openLevelUpModal(props.currentLevel)
  }
}

// GSAP анимация shine эффекта
watch(() => props.currentLevel, (newLevel) => {
  stopLevelShineAnimation()
  createLevelShineAnimation(newLevel)
}, { immediate: true })

onMounted(() => {
  createLevelShineAnimation(props.currentLevel)
})

onUnmounted(() => {
  stopLevelShineAnimation()
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
  @apply flex items-baseline gap-x-1 sm:gap-x-3 text-right p-1 sm:p-2 rounded-lg transition-all duration-300 relative overflow-hidden;
}

.level-info.clickable {
  @apply cursor-pointer hover:scale-105 active:scale-95;
}

.level-info.clickable:hover {
  @apply brightness-110;
}

.level-title-group {
  @apply flex items-center gap-1 sm:gap-1.5 font-semibold;
}

.level-icon {
  @apply text-sm sm:text-base;
}

.level-shine {
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
}

/* --- Level 1 --- */
.level-1 { @apply bg-transparent; }
.title-novice { @apply text-text-muted; }
.subtitle-novice { @apply text-text-muted/80; }

/* --- Level 2 --- */
.level-2 { @apply bg-blue-900/30; }
.title-interested { @apply text-blue-300; }
.subtitle-interested { @apply text-blue-400; }

/* --- Level 3 --- */
.level-3 { @apply bg-green-900/30 border border-green-500/20; }
.title-learning { @apply text-green-300; }
.subtitle-learning { @apply text-green-400; }

/* --- Level 4 --- */
.level-4 { @apply bg-purple-900/40 border border-purple-500/20; }
.title-partner { @apply text-purple-300; }
.subtitle-partner { @apply text-purple-400; }

/* --- Level 5 --- */
.level-5 { @apply bg-amber-900/40 border border-amber-500/20; }
.title-bro { @apply text-amber-300; }
.subtitle-bro { @apply text-amber-400 font-semibold; }
</style>