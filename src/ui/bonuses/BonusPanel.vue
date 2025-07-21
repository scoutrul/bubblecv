<template>
  <div class="bonus-panel content-card">
    <div class="panel-header">
      <h3 class="text-lg font-semibold">🎁 Бонусы</h3>
      <button @click="$emit('close')" class="close-btn">✕</button>
    </div>

    <div class="bonuses-grid">
      <div v-if="bonuses.length === 0" class="bonus-placeholder">
        <span class="text-text-muted">Проходите уровни, чтобы разблокировать бонусы!</span>
      </div>

      <div v-else class="space-y-2">
        <BonusItem
          v-for="bonus in bonuses"
          :key="bonus.id"
          :bonus="bonus"
          @click="openBonusModal(bonus)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBonuses } from '@/composables'
import BonusItem from './BonusItem.vue'
import { onMounted } from 'vue';

defineEmits<{
  close: []
}>()

const { bonuses, loadBonuses, openBonusModal } = useBonuses()

onMounted(async () => {
  await loadBonuses()
})
</script>

<style scoped>
.bonus-panel {
  pointer-events: auto;
}

.bonuses-grid {
  @apply overflow-y-auto;
  max-height: calc(100vh - 12rem);
  padding: 0.5rem;
  margin: -0.5rem;
}

@media (min-width: 640px) {
  .bonuses-grid {
    padding: 1rem;
    margin: -1rem;
  }
}

@media (max-width: 639px) {
  .bonuses-grid {
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

.bonus-placeholder {
  @apply text-center py-8;
}

.content-card {
  @apply bg-background-secondary border border-border rounded-lg p-4 shadow-lg;
  backdrop-filter: blur(10px);
  background: rgba(30, 41, 59, 0.95);
}
</style>
