<template>
  <ToolTip :text="t('game.resetTooltip')" position="right">
    <div class="reset-widget">
      <button 
        @click="$emit('handleReset')"
        class="reset-button"
        :title="t('game.resetTitle')"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
      </button>
    </div>
  </ToolTip>
</template>

<script setup lang="ts">
import ToolTip from '@/ui/shared/ToolTip.vue'
import { useI18n } from '@/composables'

const emit = defineEmits(['handleReset'])
const { t } = useI18n()
</script>

<style scoped>
.reset-widget {
  @apply relative;
}

.reset-button {
  @apply w-8 h-8 sm:w-12 sm:h-12 rounded-full;
  @apply flex items-center justify-center;
  @apply bg-background-glass backdrop-blur-md border-[0.5px] border-border;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-all duration-300;
  @apply hover:scale-110;
  @apply active:scale-95;
}

.reset-button:hover {
  @apply shadow-xl shadow-primary/30;
}

.reset-button svg {
  @apply w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300;
}

.reset-button:hover svg {
  @apply rotate-180;
}
</style> 