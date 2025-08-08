<template>
  <ToolTip :text="t('widgets.memoirs')" position="left">
    <div class="memoir-widget">
      <ToggleButton
        icon="📝"
        :badge-count="unlockedCount"
        position="center-right"
        panel-position="bottom"
        @toggle="toggleMemoirs"
        @close="closeMemoirs"
      >
        <template #panel="{ close }">
          <MemoirPanel @close="close" />
        </template>
      </ToggleButton>
    </div>
  </ToolTip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ToolTip from '@/ui/shared/ToolTip.vue'
import { useMemoirs } from '@/composables'
import { useUiEventStore } from '@/stores'
import { useI18n } from '@/composables'
import ToggleButton from '@/ui/shared/ToggleButton.vue'
import MemoirPanel from '@/ui/widgets/memoirs/MemoirPanel.vue'

const { unlockedMemoirsCount } = useMemoirs()
const uiEventStore = useUiEventStore()
const { t } = useI18n()

// Контейнер управляет данными
const unlockedCount = computed(() => unlockedMemoirsCount.value)

const toggleMemoirs = () => {
  uiEventStore.toggleMemoirsPanel()
}

const closeMemoirs = () => {
  uiEventStore.closeMemoirsPanel()
}
</script>

<style scoped>
.memoir-widget {
  pointer-events: auto;
  cursor: pointer;
}
</style> 