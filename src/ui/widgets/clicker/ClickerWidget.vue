<template>
  <ToolTip :text="tooltipText" position="right">
    <div class="clicker-widget">
      <button
        @click="handleClick"
        class="clicker-button"
        :class="{ 'is-active': isActive }"
        :title="tooltipText"
      >
        🕹️
      </button>
    </div>
  </ToolTip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ToolTip from '@/ui/shared/ToolTip.vue'
import { useClickerStore } from '@/stores'
import { useI18n } from '@/composables'

const clicker = useClickerStore()
const { t } = useI18n()

const isActive = computed(() => clicker.isActive)

const tooltipText = computed(() => {
  return isActive.value ? t.value('clicker.abortTooltip') : t.value('clicker.startTooltip')
})

const handleClick = () => {
  if (isActive.value) {
    clicker.abort()
  } else {
    clicker.openRules()
  }
}
</script>

<style scoped>
.clicker-widget {
  @apply relative;
}

.clicker-button {
  @apply w-8 h-8 sm:w-12 sm:h-12 rounded-full;
  @apply flex items-center justify-center;
  @apply bg-background-glass backdrop-blur-md border-[0.5px] border-border;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-all duration-300;
  @apply hover:scale-110;
  @apply active:scale-95;
  @apply text-sm sm:text-2xl;
}

.clicker-button:hover {
  @apply shadow-xl shadow-primary/30;
}

.clicker-button.is-active {
  @apply text-primary;
  @apply shadow-xl shadow-primary/30;
}
</style>
