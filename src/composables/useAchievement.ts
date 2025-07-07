import { ref, computed } from 'vue'
import { useAchievmentStore } from '@/stores'


export function useAchievement() {
  const showAchievements = ref(false)

  const achievementStore = useAchievmentStore()

  const unlockedAchievements = computed(() => achievementStore.achievements.filter(a => a.isUnlocked))

  return {
    showAchievements,
    unlockedAchievements: unlockedAchievements.value.length,
    toggleAchievements: () => showAchievements.value = !showAchievements.value,
    closeAchievements: () => showAchievements.value = false,
    loadAchievements : achievementStore.loadAchievements
  }
}