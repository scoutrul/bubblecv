<template>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMemoirs } from '@/composables'
import { useUiEventStore } from '@/stores'
import ToggleButton from '@/ui/global/ToggleButton.vue'
import MemoirPanel from '@/ui/memoirs/MemoirPanel.vue'

const { unlockedMemoirsCount } = useMemoirs()
const uiEventStore = useUiEventStore()

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