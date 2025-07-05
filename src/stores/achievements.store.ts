import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Achievement } from '@/types/data'

import { api } from '@/api'
import { useUiEventStore } from '@/stores/ui-event.store'
import { useSessionStore } from '@/stores/session.store'
import { useModalStore } from '@/stores/modal.store'

export const useGameStore = defineStore('achievmentStore', () => {
  const achievements = ref<Achievement[]>([])

  const isLoading = ref(true)

  const pendingUnlockIds = ref(new Set<string>())

  const unlockedAchievements = computed(() => achievements.value.filter(a => a.isUnlocked))

  const LoadAchievments = async () => {
    isLoading.value = true

    try {
      const { data } = await api.getAchievements()
      achievements.value = data
    } catch (err) {
      console.error('❌ Ошибка загрузки уровней:', err)
    } finally {
      isLoading.value = false
    }
  }

  const unlockAchievement = async (id: string, showModal: boolean = true) => {
    if (pendingUnlockIds.value.has(id)) {
      return null
    }

    const achievement = achievements.value.find(a => a.id === id)
    
    if (!achievement) {
      console.warn(`⚠️ Achievement ${id} not found`)
      return null
    }
    
    if (achievement.isUnlocked) {
      console.log(`ℹ️ Achievement ${id} already unlocked, isShown: ${achievement.isShown}`)
      return null
    }
    
    try {
      pendingUnlockIds.value.add(id)

      achievement.isUnlocked = true
      console.log('🏆 Достижение разблокировано:', achievement.name)
      
      const uiEventStore = useUiEventStore()
      uiEventStore.queueShake('achievements')

      const sessionStore = useSessionStore()
      await sessionStore.gainXP(achievement.xpReward)

      if (showModal) {
        const modalStore = useModalStore()
        modalStore.queueOrShowAchievement({
          title: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward
        })
        achievement.isShown = true
        console.log(`✅ Achievement modal queued for ${id}`)
      }
      
      return achievement
    } finally {
      pendingUnlockIds.value.delete(id)
    }
  }

  const resetAchievements = () => {
    achievements.value.forEach(a => {
      a.isUnlocked = false
      a.isShown = false
    })
  }

  LoadAchievments()

  return {
    isLoading,
    achievements,
    unlockedAchievements,
    resetAchievements,
    unlockAchievement,
  }
}) 