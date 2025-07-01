<template>
  <!-- Фон для закрытия по клику вне области -->
  <div 
    class="achievements-overlay"
    @click="$emit('close')"
  >
    <div 
      class="achievements-panel content-card"
      @click.stop
    >
    <div class="panel-header">
      <h3 class="text-lg font-semibold">🏆 Достижения</h3>
      <button @click="$emit('close')" class="close-btn">✕</button>
    </div>
    
    <div class="achievements-grid">
      <div v-if="unlockedAchievements.length === 0" class="achievement-placeholder">
        <span class="text-text-muted">Пока нет достижений. Исследуйте пузыри, чтобы их разблокировать!</span>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/app/stores/game.store'
import AchievementItem from './AchievementItem.vue'

defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const unlockedAchievements = computed(() => 
  gameStore.achievements.filter(achievement => achievement.unlockedAt)
)
</script>

<style scoped>
.achievements-overlay {
  @apply fixed inset-0;
  z-index: 1400;
  pointer-events: auto;
}

.achievements-panel {
  @apply absolute bottom-[4rem] right-[1rem] mb-2 w-80;
  z-index: 1500;
  pointer-events: auto;
  max-height: calc(100vh - 8rem);
  min-height: fit-content;
}

.achievements-grid {
  @apply overflow-y-auto;
  max-height: calc(100vh - 12rem);
  padding-right: 1rem;
  margin-right: -1rem;
}

.panel-header {
  @apply flex justify-between items-center mb-4;
}

.close-btn {
  @apply w-6 h-6 flex items-center justify-center rounded hover:bg-background-secondary;
  pointer-events: auto;
  cursor: pointer;
}

.achievement-placeholder {
  @apply text-center py-8;
}
</style> 