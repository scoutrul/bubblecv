import { defineStore } from 'pinia'
import { reactive, ref, computed, watch } from 'vue'
import type { BubbleNode } from '@/types/canvas'
import type { Question } from '@/types/data'
import type { NormalizedLevel } from '@/types/normalized'
import { useSessionStore } from '@/stores/session.store'
import { useLevelStore } from '@/stores/levels.store'

export interface PendingAchievement {
  title: string
  description: string
  icon: string
  xpReward: number
}

interface LevelUpData extends NormalizedLevel {
  level: number
  title: string
  description: string
  icon: string
  currentXP: number
  xpGained: number
  unlockedFeatures: string[]
}

export const useModalStore = defineStore('modalStore', () => {
  const sessionStore = useSessionStore()
  const gameStore = useLevelStore()

  const modals = reactive({
    welcome: false,
    bubble: false,
    levelUp: false,
    philosophy: false,
    gameOver: false,
    achievement: false
  })

  const data = reactive({
    currentBubble: null as BubbleNode | null,
    currentQuestion: null as Question | null,
    philosophyBubbleId: null as BubbleNode['id'] | null,
    achievement: null as PendingAchievement | null,
    gameOverStats: null as { currentXP: number; currentLevel: number } | null,
    currentLevel: 1,
    levelUpData: {
      level: 1,
      title: '',
      description: '',
      icon: '👋',
      currentXP: 0,
      xpGained: 0,
      unlockedFeatures: [],
      xpRequired: 0
    } as LevelUpData
  })

  const pendingAchievements = ref<PendingAchievement[]>([])

  const isAnyModalOpen = computed(() =>
    Object.values(modals).some(v => v)
  )

  const hasActiveModals = computed(() =>
    modals.welcome || modals.bubble || modals.levelUp || modals.philosophy || modals.gameOver
  )

  watch(isAnyModalOpen, (visible, wasVisible) => {
    if (!visible && wasVisible) {
      window.dispatchEvent(new CustomEvent('process-shake-queue'))
      processPendingAchievements()
    }
  })

  const processPendingAchievements = () => {
    if (!hasActiveModals.value && pendingAchievements.value.length > 0) {
      const next = pendingAchievements.value.shift()
      if (next) {
        data.achievement = next
        modals.achievement = true
      }
    }
  }

  const queueOrShowAchievement = (achievement: PendingAchievement) => {
    if (modals.levelUp || hasActiveModals.value) {
      pendingAchievements.value.push(achievement)
    } else {
      data.achievement = achievement
      modals.achievement = true
    }
  }

  const openModal = (key: keyof typeof modals) => (modals[key] = true)
  const closeModal = (key: keyof typeof modals) => {
    modals[key] = false
    if (key !== 'achievement') processPendingAchievements()
    window.dispatchEvent(new CustomEvent('process-shake-queue'))
  }

  const openBubbleModal = (bubble: BubbleNode) => {
    data.currentBubble = bubble
    openModal('bubble')
  }

  const continueBubbleModal = () => {
    const bubbleId = data.currentBubble?.id
    closeModal('bubble')
    data.currentBubble = null
    if (bubbleId) {
      window.dispatchEvent(new CustomEvent('bubble-continue', { detail: { bubbleId } }))
    }
  }

  const openLevelUpModal = (level: number, payload?: Partial<LevelUpData>) => {
    if (modals.achievement && data.achievement) {
      pendingAchievements.value.unshift(data.achievement)
      modals.achievement = false
      data.achievement = null
    }

    data.currentLevel = level
    data.levelUpData = {
      level,
      title: payload?.title ?? '',
      description: payload?.description ?? '',
      icon: payload?.icon ?? '👋',
      currentXP: payload?.currentXP ?? 0,
      xpGained: payload?.xpGained ?? 0,
      unlockedFeatures: payload?.unlockedFeatures ?? [],
      xpRequired: payload?.xpRequired ?? 0
    }

    openModal('levelUp')
  }

  const openPhilosophyModal = (question: Question, bubbleId?: BubbleNode['id']) => {
    data.currentQuestion = question
    data.philosophyBubbleId = bubbleId ?? null
    openModal('philosophy')
  }

  const handlePhilosophyAnswer = async (answer: 'agree' | 'disagree') => {
    const isNegative = answer === 'disagree'
    const bubbleId = data.philosophyBubbleId

    if (answer === 'agree') {
      const leveledUp = await sessionStore.gainPhilosophyXP()
      if (leveledUp) {
        const icon = ['👋', '🤔', '📚', '🤝', '🤜🤛'][sessionStore.currentLevel - 1] || '⭐'
        const levelData = gameStore.getLevelByNumber(sessionStore.currentLevel)
        openLevelUpModal(sessionStore.currentLevel, {
          title: levelData?.title,
          description: levelData?.description,
          currentXP: sessionStore.currentXP,
          xpGained: 5,
          unlockedFeatures: levelData?.unlockedFeatures ?? [],
          icon
        })
      }
    } else {
      const gameOver = await sessionStore.losePhilosophyLife()
      if (gameOver) {
        data.gameOverStats = {
          currentXP: sessionStore.currentXP,
          currentLevel: sessionStore.currentLevel
        }
        openModal('gameOver')
      }
    }

    closeModal('philosophy')

    if (bubbleId) {
      window.dispatchEvent(new CustomEvent('bubble-continue', {
        detail: { bubbleId, isPhilosophyNegative: isNegative }
      }))
    }
  }

  const restartGame = async () => {
    await sessionStore.startSession()
    closeModal('gameOver')
    window.dispatchEvent(new CustomEvent('game-restart'))
  }

  const closeAchievementModal = () => {
    modals.achievement = false
    data.achievement = null
    setTimeout(() => processPendingAchievements(), 0)
  }

  return {
    modals,
    data,

    isAnyModalOpen,
    hasActiveModals,

    openWelcome: () => openModal('welcome'),
    closeWelcome: () => closeModal('welcome'),

    openBubbleModal,
    closeBubbleModal: () => closeModal('bubble'),
    continueBubbleModal,

    openLevelUpModal,
    closeLevelUpModal: () => closeModal('levelUp'),

    openPhilosophyModal,
    closePhilosophyModal: () => closeModal('philosophy'),
    handlePhilosophyAnswer,

    openGameOverModal: () => openModal('gameOver'),
    closeGameOverModal: () => closeModal('gameOver'),
    restartGame,

    openAchievementModal: queueOrShowAchievement,
    closeAchievementModal,

    queueOrShowAchievement,
    processPendingAchievements
  }
})
