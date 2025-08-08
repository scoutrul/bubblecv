<template>
  <div
    class="achievements-panel content-card"
  >
    <div class="panel-header">
      <h3 class="text-lg font-semibold">🏆 {{ t('achievements.title') }}</h3>
      <button @click="$emit('close')" class="close-btn">✕</button>
    </div>

    <div class="achievements-grid">
      <div v-if="unlockedAchievements.length === 0" class="achievement-placeholder">
        <span class="text-text-muted">{{ t('achievements.placeholder') }}</span>
      </div>

      <div v-else class="space-y-2">
        <AchievementItem
          v-for="achievement in unlockedAchievements"
          :key="achievement.id"
          :achievement="achievement"
        />
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import AchievementItem from './AchievementItem.vue'
import type { Achievement } from '@/types/data'
import { useI18n } from '@/composables'

interface Props {
  unlockedAchievements: Achievement[]
}

defineProps<Props>()
const { t } = useI18n()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.achievements-panel {
  pointer-events: auto;
}

.achievements-grid {
  @apply overflow-y-auto;
  max-height: calc(100vh - 12rem);
  padding-right: 0.5rem;
  margin-right: -0.5rem;
}

@media (min-width: 640px) {
  .achievements-grid {
    padding-right: 1rem;
    margin-right: -1rem;
  }
}

@media (max-width: 359px) {
  .achievements-grid {
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

.achievement-placeholder {
  @apply text-center py-8;
}
</style> 