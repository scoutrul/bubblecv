<template>
  <div class="achievements-panel content-card">
    <div class="panel-header">
      <h3 class="text-lg font-semibold">🏆 Достижения</h3>
      <button @click="$emit('close')" class="close-btn">✕</button>
    </div>
    
    <div class="achievements-grid">
      <div v-if="unlockedAchievements.length === 0" class="achievement-placeholder">
        <span class="text-text-muted">Пока нет достижений. Исследуйте пузыри, чтобы их разблокировать!</span>
      </div>
      
      <div v-else class="space-y-3">
        <div 
          v-for="achievement in unlockedAchievements" 
          :key="achievement.id"
          class="achievement-item unlocked"
        >
          <div class="achievement-icon">
            <span class="text-2xl">{{ achievement.icon }}</span>
          </div>
          
          <div class="achievement-content">
            <h4 class="achievement-name">
              {{ achievement.name }}
            </h4>
            <p class="achievement-description">
              {{ achievement.description }}
            </p>
            <div class="achievement-xp">
              +{{ achievement.xpReward }} XP
            </div>
            <div v-if="achievement.unlockedAt" class="achievement-date">
              {{ formatDate(achievement.unlockedAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@features/gamification/model/game-store'

defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const unlockedAchievements = computed(() => 
  gameStore.achievements.filter(achievement => achievement.unlockedAt)
)

const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ru', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
</script>

<style scoped>
.achievements-panel {
  @apply absolute bottom-[4rem] right-[1rem] mb-2 w-80 max-h-96 overflow-y-auto;
  z-index: 1500;
  pointer-events: auto;
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

.achievement-item {
  @apply flex items-start gap-3 p-3 rounded-lg border transition-all duration-200;
}

.achievement-item.unlocked {
  @apply bg-green-50 border-green-200 shadow-sm;
}

.achievement-icon {
  @apply flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full;
}

.achievement-item.unlocked .achievement-icon {
  @apply bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md;
}

.achievement-content {
  @apply flex-1 min-w-0;
}

.achievement-name {
  @apply font-semibold text-gray-800 text-sm mb-1;
}

.achievement-description {
  @apply text-xs text-gray-600 leading-relaxed mb-2;
}

.achievement-xp {
  @apply inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-md;
}

.achievement-date {
  @apply text-xs text-gray-500 mt-1;
}
</style> 