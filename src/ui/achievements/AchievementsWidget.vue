<template>
  <div class="achievements-widget">
    <!-- Кнопка достижений -->
    <div class="achievements-toggle-container">
      <AchievementsToggle 
        :unlocked-count="unlockedCount"
        :is-shaking="isShaking"
        @toggle="toggleAchievements"
        class="achievements-toggle"
      />
      <span class="achievement-badge" v-if="unlockedCount > 0">{{ unlockedCount }}</span>
    </div>
    
    <!-- Панель достижений -->
    <AchievementsPanel 
      v-if="showAchievements"
      @close="closeAchievements"
      class="achievements-panel"
    />
  </div>
</template>

<script setup lang="ts">
import AchievementsToggle from '@/ui/hud/AchievementsToggle.vue'
import AchievementsPanel from '@/ui/achievements/AchievementsPanel.vue'

interface Props {
  unlockedCount: number
  isShaking: boolean
  showAchievements: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleAchievements = () => {
  emit('toggle')
}

const closeAchievements = () => {
  emit('close')
}
</script>

<style scoped>
.achievements-widget {
  @apply fixed bottom-4 right-2 sm:right-4;
  @apply z-50;
}

.achievements-toggle-container {
  @apply relative;
}

.achievements-toggle {
  @apply relative;
}

.achievement-badge {
  @apply absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1;
  @apply w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full;
  @apply text-xs font-bold text-white;
  @apply flex items-center justify-center;
  @apply border border-background-secondary sm:border-2;
  @apply z-20;
}

.achievements-panel {
  @apply absolute bottom-full right-0 mb-4;
  @apply w-72 sm:w-80;
  max-height: calc(100vh - 8rem);
  min-height: fit-content;
}
</style> 