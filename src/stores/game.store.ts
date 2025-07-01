import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Achievement, ContentLevel, Level } from '@shared/types'
import { allAchievements } from '@/shared/assets/achievements'
import { GAME_CONFIG } from '@shared/config/game-config'
import { api } from '@shared/api'
import { useUiEventStore } from '@/stores/ui-event.store'

export const useGameStore = defineStore('game', () => {
  const achievements = ref<Achievement[]>([])
  const contentLevels = ref<ContentLevel[]>([])
  const levels = ref<Level[]>([])
  const currentLevel = ref(1)
  const currentXP = ref(0)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const pendingUnlockIds = ref(new Set<string>())

  const unlockedAchievements = computed(() => achievements.value.filter(a => a.isUnlocked))

  const initializeAchievements = () => {
    achievements.value = allAchievements.map(a => ({
      ...a,
      isUnlocked: false,
      isShown: false,
      unlockedAt: undefined
    }))
    console.log('🏆 Достижения инициализированы:', achievements.value.length)
  }

  const loadContentLevels = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await api.getContentLevels()
      levels.value = data.levels
      contentLevels.value = data.levels.map((level: Level) => ({
        ...level,
        xpRequired: GAME_CONFIG.levelRequirements[level.level as keyof typeof GAME_CONFIG.levelRequirements] || level.xpRequired,
      }))
      console.log('📚 Уровни загружены:', contentLevels.value.length)
    } catch (err) {
      console.error('❌ Ошибка загрузки уровней:', err)
      error.value = 'Failed to load content levels'
    } finally {
      isLoading.value = false
    }
  }

  const getLevelByNumber = (level: number) => contentLevels.value.find(l => l.level === level)

  const unlockAchievement = async (id: string, showModal: boolean = true) => {
    if (pendingUnlockIds.value.has(id)) {
      console.log(`⏳ Unlock for ${id} already in progress. Skipping.`)
      return null
    }

    const achievement = achievements.value.find(a => a.id === id)
    
    // Логирование для отладки
    console.log(`🔍 unlockAchievement called for ${id}, showModal: ${showModal}`)
    
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
      achievement.unlockedAt = new Date().toISOString()
      console.log('🏆 Достижение разблокировано:', achievement.name)
      
      const uiEventStore = useUiEventStore()
      uiEventStore.queueShake('achievements')

      const { useSessionStore } = await import('@/stores/session.store')
      const sessionStore = useSessionStore()
      await sessionStore.gainXP(achievement.xpReward)

      if (showModal) {
        const { useModalStore } = await import('@/stores/modal.store')
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
  
  const checkAndUnlockBubbleAchievements = (bubbleCount: number) => {
    const BUBBLE_ACHIEVEMENTS = {
      10: 'bubble-explorer-10',
      30: 'bubble-explorer-30',
      50: 'bubble-explorer-50'
    }
    for (const [count, id] of Object.entries(BUBBLE_ACHIEVEMENTS)) {
      if (bubbleCount >= parseInt(count)) {
        unlockAchievement(id)
      }
    }
  }

  const resetAchievements = () => {
    achievements.value.forEach(a => {
      a.isUnlocked = false
      a.isShown = false
      a.unlockedAt = undefined
    })
  }

  initializeAchievements()
  loadContentLevels()

  return {
    achievements,
    contentLevels,
    levels,
    currentLevel,
    currentXP,
    unlockedAchievements,
    loadContentLevels,
    getLevelByNumber,
    checkAndUnlockBubbleAchievements,
    resetAchievements,
    unlockAchievement,
    isLoading,
    error,
  }
}) 