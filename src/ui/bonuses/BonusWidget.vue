<template>
  <div class="bonus-widget">
    <ToggleButton
      icon="🎁"
      :badge-count="unlockedCount"
      :is-shaking="isShaking"
      position="center-right"
      panel-position="bottom"
      @toggle="toggleBonuses"
      @close="closeBonuses"
    >
      <template #panel="{ close }">
        <BonusPanel @close="close" />
      </template>
    </ToggleButton>
  </div>
</template>

<script setup lang="ts">
import ToggleButton from '@/ui/global/ToggleButton.vue'
import BonusPanel from '@/ui/bonuses/BonusPanel.vue'

interface Props {
  unlockedCount: number
  isShaking: boolean
  showBonuses: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleBonuses = () => {
  emit('toggle')
}

const closeBonuses = () => {
  emit('close')
}
</script>

<style scoped>
.bonus-widget {
  @apply fixed bottom-20 right-2 sm:right-4 sm:bottom-24;
  @apply z-[9999];
  pointer-events: auto;
}
</style> 