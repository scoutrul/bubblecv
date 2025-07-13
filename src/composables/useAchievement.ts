import { useAchievmentStore, useUiEventStore, useSessionStore, useModalStore } from '@/stores'
import { computed, ref } from 'vue'

export function useAchievement() {
  const achievementStore = useAchievmentStore()
  const sessionStore = useSessionStore()
  const uiEventStore = useUiEventStore()
  const modalStore = useModalStore()

  const pendingUnlockIds = ref(new Set<string>())

  const unlockAchievement = async (id: string, showModal = true) => {
    if (pendingUnlockIds.value.has(id)) {
      return null
    }
    
    const achievement = achievementStore.achievements.find(a => a.id === id)
    if (!achievement) {
      return null
    }
    
    if (achievement.isUnlocked) {
      return null
    }
    
    pendingUnlockIds.value.add(id)

    try {
      // Проверяем условия для конкретных ачивок
      if (id === 'tough-bubble-popper') {
        if (sessionStore.session?.hasUnlockedFirstToughBubbleAchievement) {
          return null // Уже разблокирована
        }
        sessionStore.setHasDestroyedToughBubble(true)
        sessionStore.setHasUnlockedFirstToughBubbleAchievement(true)
      }

      achievement.isUnlocked = true
      uiEventStore.queueShake('achievements')
      // XP начисляется в useSession композабле, уберем дублирование

      // Не добавляем в pending здесь - это делается в useModals.openAchievementModal
      if (showModal) {
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
    uiEventStore.toggleAchievements()
  }

  const closeAchievements = () => {
    uiEventStore.closeAchievements()
  }

  const resetAchievements = () => {
    achievementStore.achievements.forEach(a => {
      a.isUnlocked = false
      a.isShown = false
    })
  }

  return {
    unlockAchievement,
    showAchievements: computed(() => uiEventStore.showAchievements),
    unlockedCount,
    toggleAchievements,
    closeAchievements,
    loadAchievements: achievementStore.loadAchievements,
    resetAchievements,
  }
}
