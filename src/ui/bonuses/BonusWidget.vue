<template>
  <ToolTip :text="t('widgets.bonuses')" position="left">
    <div class="bonus-widget">
      <ToggleButton
        icon="🎁"
        :badge-count="unlockedCount"
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
  </ToolTip>
</template>

<script setup lang="ts">
import ToolTip from '@/ui/global/ToolTip.vue'
import ToggleButton from '@/ui/global/ToggleButton.vue'
import BonusPanel from '@/ui/bonuses/BonusPanel.vue'
import { useI18n } from '@/composables'
import type { NormalizedBonus } from '@/types/normalized'

interface Props {
  unlockedCount: number
  showBonuses: boolean
  unlockedBonuses: NormalizedBonus[]
}

interface Emits {
  (e: 'toggle'): void
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const toggleBonuses = () => {
  emit('toggle')
}

const closeBonuses = () => {
  emit('close')
}
</script>

<style scoped>
.bonus-widget {
  pointer-events: auto;
  cursor: pointer;
}
</style> 