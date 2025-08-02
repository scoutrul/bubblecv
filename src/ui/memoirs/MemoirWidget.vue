<template>
  <div class="memoir-widget">
    <ToggleButton
      icon="📝"
      :badge-count="unlockedCount"
      :is-shaking="isShaking"
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
import ToggleButton from '@/ui/global/ToggleButton.vue'
import MemoirPanel from '@/ui/memoirs/MemoirPanel.vue'

interface Props {
  unlockedCount: number
  isShaking: boolean
  showMemoirs: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleMemoirs = () => {
  emit('toggle')
}

const closeMemoirs = () => {
  emit('close')
}
</script>

<style scoped>
.memoir-widget {
  pointer-events: auto;
  cursor: pointer;
}
</style> 