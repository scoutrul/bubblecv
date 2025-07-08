import { useAchievmentStore, useUiEventStore, useSessionStore, useModalStore } from '@/stores'
import { computed, ref } from 'vue'

export function useAchievement() {
  const achievementStore = useAchievmentStore()
  const sessionStore = useSessionStore()
  const uiEventStore = useUiEventStore()
  const modalStore = useModalStore()

  const showAchievements = ref(false)

  const pendingUnlockIds = ref(new Set<string>())

  const unlockAchievement = async (id: string, showModal = true) => {
    if (pendingUnlockIds.value.has(id)) return null
    pendingUnlockIds.value.add(id)

    try {
      const achievement = achievementStore.achievements.find(a => a.id === id)
      if (!achievement) return null
      if (achievement.isUnlocked) return null

      achievement.isUnlocked = true
      uiEventStore.queueShake('achievements')
      await sessionStore.gainXP(achievement.xpReward)

      if (showModal) {
        modalStore.queueOrShowAchievement({
          title: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward
        })
        achievement.isShown = true
      }

      return achievement
    } finally {
      pendingUnlockIds.value.delete(id)
    }
  }
  
  const unlockedAchievements = computed(() => 
    achievementStore.achievements.filter(a => a.isUnlocked)
  )

  const unlockedCount = computed(() => unlockedAchievements.value.length)

  const toggleAchievements = () => {
    showAchievements.value = !showAchievements.value
  }

  const closeAchievements = () => {
    showAchievements.value = false
  }

  const resetAchievements = () => {
    achievementStore.achievements.forEach(a => {
      a.isUnlocked = false
      a.isShown = false
    })
  }

  return {
    unlockAchievement,
    showAchievements,
    unlockedCount,
    toggleAchievements,
    closeAchievements,
    loadAchievements: achievementStore.loadAchievements,
    resetAchievements,
  }
}
