<template>
  <div class="achievements-toggle-wrapper">
    <button 
      @click="$emit('toggle')"
      class="achievements-toggle"
      :class="{ 'shake-animation': isShaking }"
    >
      🏆
      <span class="achievement-badge">{{ unlockedCount }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  unlockedCount: number
}

interface Emits {
  toggle: []
}

const props = defineProps<Props>()
defineEmits<Emits>()

const isShaking = ref(false)

watch(() => props.unlockedCount, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal && newVal > oldVal) {
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 600)
  }
})
</script>

<style scoped>
.achievements-toggle-wrapper {
  @apply flex-shrink-0;
}

.achievements-toggle {
  @apply flex items-center gap-2 px-3 py-2;
  @apply bg-background-card hover:bg-background-secondary;
  @apply border border-border hover:border-border-light;
  @apply rounded-lg transition-all duration-200;
  @apply text-sm font-medium;
}

.achievement-badge {
  @apply text-xs bg-primary text-white rounded-full;
  @apply px-2 py-0.5 min-w-[1.25rem] text-center;
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