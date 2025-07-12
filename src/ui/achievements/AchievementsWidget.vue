<template>
  <div class="achievements-widget">
    <!-- Кнопка достижений -->
    <AchievementsToggle 
      :unlocked-count="unlockedCount"
      :is-shaking="isShaking"
      @toggle="toggleAchievements"
      class="achievements-toggle"
    />
    
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

.achievements-toggle {
  @apply relative;
}

.achievements-panel {
  @apply absolute bottom-full right-0 mb-4;
  @apply w-72 sm:w-80;
  max-height: calc(100vh - 8rem);
  min-height: fit-content;
}

/* Для очень узких экранов */
@media (max-width: 359px) {
  .achievements-widget {
    @apply right-2 left-2;
  }
  
  .achievements-panel {
    @apply right-0 left-0 w-auto;
    max-height: calc(100vh - 6rem);
  }
}
</style> 