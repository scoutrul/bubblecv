<template>
  <div class="memoir-panel content-card">
    <div class="panel-header">
      <h3 class="text-lg font-semibold">📝 Мемуары</h3>
      <button @click="$emit('close')" class="close-btn">✕</button>
    </div>

    <div class="memoirs-grid">
      <div v-if="memoirs.length === 0" class="memoir-placeholder">
        <span class="text-text-muted">Проходите уровни, чтобы разблокировать мемуары!</span>
      </div>

      <div v-else class="space-y-2">
        <MemoirItem
          v-for="memoir in memoirs"
          :key="memoir.id"
          :memoir="memoir"
          @click="openMemoirModal(memoir)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMemoirs } from '@/composables'
import MemoirItem from './MemoirItem.vue'
import { onMounted } from 'vue';

defineEmits<{
  close: []
}>()

const { memoirs, loadMemoirs, openMemoirModal } = useMemoirs()

onMounted(async () => {
  await loadMemoirs()
})
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

.content-card {
  @apply bg-background-secondary border border-border rounded-lg p-4 shadow-lg;
  backdrop-filter: blur(10px);
  background: rgba(30, 41, 59, 0.95);
}
</style> 