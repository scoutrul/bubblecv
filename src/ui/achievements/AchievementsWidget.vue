<template>
  <div class="achievements-widget">
    <ToggleButton
      icon="🏆"
      :badge-count="unlockedCount"
      :is-shaking="isShaking"
      position="bottom-right"
      panel-position="bottom"
      @toggle="$emit('toggle')"
      @close="$emit('close')"
    >
      <template #panel="{ close }">
        <AchievementsPanel 
          :unlocked-achievements="unlockedAchievements"
          @close="close" 
        />
      </template>
    </ToggleButton>
  </div>
</template>

<script setup lang="ts">
import ToggleButton from '@/ui/global/ToggleButton.vue'
import AchievementsPanel from '@/ui/achievements/AchievementsPanel.vue'
import type { Achievement } from '@/types/data'

interface Props {
  unlockedCount: number
  isShaking: boolean
  showAchievements: boolean
  unlockedAchievements: Achievement[]
}

interface Emits {
  (e: 'toggle'): void
  (e: 'close'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.achievements-widget {
  @apply fixed bottom-4 right-2 sm:right-4;
  @apply z-[10000];
  pointer-events: auto;
  cursor: pointer;
}
</style> 