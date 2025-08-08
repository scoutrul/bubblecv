<template>
  <div class="memoir-panel content-card">
    <div class="panel-header">
      <h3 class="text-lg font-semibold">📝 {{ t('memoirs.title') }}</h3>
      <button @click="$emit('close')" class="close-btn">✕</button>
    </div>

    <div class="memoirs-grid">
      <div v-if="isLoading" class="memoir-placeholder">
        <span class="text-text-muted">{{ t('memoirs.loading') }}</span>
      </div>
      
      <div v-else-if="unlockedMemoirs.length === 0" class="memoir-placeholder">
        <span class="text-text-muted">{{ t('memoirs.placeholder') }}</span>
      </div>

      <div v-else class="space-y-2">
        <MemoirItem
          v-for="memoir in unlockedMemoirs"
          :key="memoir.id"
          :memoir="memoir"
          :is-read="memoir.isRead"
          @click="handleMemoirClick(memoir)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMemoirs } from '@/composables'
import { useI18n } from '@/composables'
import MemoirItem from './MemoirItem.vue'
import type { NormalizedMemoir } from '@/types/normalized'

defineEmits<{
  close: []
}>()

const { unlockedMemoirs, isLoading, loadMemoirs } = useMemoirs()
const { t } = useI18n()

onMounted(async () => {
  await loadMemoirs()
})

const handleMemoirClick = async (memoir: NormalizedMemoir) => {
  const { useModals } = await import('@/composables/useModals')
  const { openMemoirModal } = useModals()
  openMemoirModal(memoir)
}
</script>

<style scoped>
.memoir-panel {
  pointer-events: auto;
}

.memoirs-grid {
  @apply overflow-y-auto;
  max-height: calc(100vh - 12rem);
  padding: 0.5rem;
  margin: -0.5rem;
}

@media (min-width: 640px) {
  .memoirs-grid {
    padding: 1rem;
    margin: -1rem;
  }
}

@media (max-width: 639px) {
  .memoirs-grid {
    max-height: calc(100vh - 8rem);
  }
}

.panel-header {
  @apply flex justify-between items-center mb-2 sm:mb-4;
}

.panel-header h3 {
  @apply text-base sm:text-lg;
}

.close-btn {
  @apply w-6 h-6 flex items-center justify-center rounded;
  pointer-events: auto;
  cursor: pointer;
}

.memoir-placeholder {
  @apply text-center py-8;
}
</style> 