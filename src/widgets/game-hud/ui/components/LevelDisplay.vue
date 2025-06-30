<template>
  <div class="level-display">
    <div class="level-info" :class="[levelClass, { 'shake-animation': isShaking }]">
      <span class="level-title" :class="titleClass">
        <span class="level-icon">{{ levelIcon }}</span>
        Уровень {{ currentLevel }}
      </span>
      <span class="level-separator">•</span>
      <span class="level-subtitle" :class="subtitleClass">{{ levelTitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  currentLevel: number
  levelTitle: string
}

const props = defineProps<Props>()
const isShaking = ref(false)

watch(() => props.currentLevel, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 600)
  }
})

// Иконки для разных уровней
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

// CSS классы для уровней
const levelClass = computed(() => {
  return `level-${props.currentLevel}`
})

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

/* Базовые стили для информации об уровне */
.level-info {
  @apply text-right flex items-center gap-2 transition-all duration-500 rounded-lg p-2;
}

.level-title {
  @apply text-sm font-semibold flex items-center gap-1 transition-all duration-300;
}

.level-icon {
  @apply text-base;
}

.level-separator {
  @apply text-xs text-text-secondary;
}

.level-subtitle {
  @apply text-xs transition-all duration-300;
}

/* Стили для Уровня 1 - Посетитель */
.title-novice {
  @apply text-gray-400;
}

.subtitle-novice {
  @apply text-gray-500;
}

/* Стили для Уровня 2 - Заинтересованный */
.title-interested {
  @apply text-blue-400;
}

.subtitle-interested {
  @apply text-blue-300 font-medium;
}

.level-2 {
  @apply animate-pulse;
}

/* Стили для Уровня 3 - Изучающий */
.title-learning {
  @apply text-green-400;
}

.subtitle-learning {
  @apply text-green-300 font-semibold;
}

.level-3 {
  @apply bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30;
}

/* Стили для Уровня 4 - Партнёр */
.title-partner {
  @apply text-purple-400 font-bold;
}

.subtitle-partner {
  @apply text-purple-300 font-bold;
}

.level-4 {
  @apply bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/50;
  animation: glow-purple 2s ease-in-out infinite alternate;
}

/* Стили для Уровня 5 - BRO */
.title-bro {
  @apply text-yellow-400 font-black text-base;
}

.subtitle-bro {
  @apply text-yellow-300 font-black;
}

.level-5 {
  @apply bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500/70;
  animation: glow-gold 1.5s ease-in-out infinite alternate;
}

/* Анимации свечения */
@keyframes glow-purple {
  from {
    border-color: rgba(168, 85, 247, 0.5);
    background: linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2));
  }
  to {
    border-color: rgba(168, 85, 247, 0.8);
    background: linear-gradient(to right, rgba(168, 85, 247, 0.3), rgba(139, 92, 246, 0.3));
  }
}

@keyframes glow-gold {
  from {
    border-color: rgba(251, 191, 36, 0.7);
    background: linear-gradient(to right, rgba(251, 191, 36, 0.3), rgba(249, 115, 22, 0.3));
  }
  to {
    border-color: rgba(251, 191, 36, 1);
    background: linear-gradient(to right, rgba(251, 191, 36, 0.4), rgba(249, 115, 22, 0.4));
  }
}

/* Дополнительные эффекты для BRO уровня */
.level-5 .level-icon {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.shake-animation {
  animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
}
</style> 