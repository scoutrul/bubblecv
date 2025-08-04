<template>
  <ToolTip :text="t('widgets.achievements')" position="left">
    <div class="achievements-widget">
      <ToggleButton
        icon="🏆"
        :badge-count="unlockedCount"
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
  </ToolTip>
</template>

<script setup lang="ts">
import ToolTip from '@/ui/global/ToolTip.vue'
import ToggleButton from '@/ui/global/ToggleButton.vue'
import AchievementsPanel from '@/ui/achievements/AchievementsPanel.vue'
import { useI18n } from '@/composables'
import type { Achievement } from '@/types/data'

interface Props {
  unlockedCount: number
  showAchievements: boolean
  unlockedAchievements: Achievement[]
}

interface Emits {
  (e: 'toggle'): void
  (e: 'close'): void
}

defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()
</script>

<style scoped>
.achievements-widget {
  pointer-events: auto;
  cursor: pointer;
}
</style> 