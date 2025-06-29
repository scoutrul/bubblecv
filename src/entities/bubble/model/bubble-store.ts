import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Bubble, SkillLevel, BubbleSize } from '../../../shared/types'
import { SKILL_LEVEL_API_MAPPING, SKILL_TO_BUBBLE_SIZE, SKILL_LEVELS } from '../../../shared/constants/skill-levels'

export const useBubbleStore = defineStore('bubble', () => {
  const bubbles = ref<Bubble[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadBubbles = async () => {
    console.log('🔄 Loading bubbles...')
    isLoading.value = true
    error.value = null
    
    try {
      // Загружаем данные с сервера
      const response = await fetch('http://localhost:3003/api/bubbles')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load bubbles')
      }
      
      // Трансформируем данные в правильный формат
      bubbles.value = data.data.map((rawBubble: any) => {
        // Преобразуем уровень навыка
        const skillLevel = SKILL_LEVEL_API_MAPPING[rawBubble.skill_level] || SKILL_LEVELS.NOVICE
        const bubbleSize: BubbleSize = SKILL_TO_BUBBLE_SIZE[skillLevel]
        
        return {
          id: rawBubble.id,
          name: rawBubble.name,
          skillLevel,
          yearStarted: rawBubble.year_started,
          yearEnded: rawBubble.year_ended,
          isActive: rawBubble.is_active,
          isEasterEgg: rawBubble.is_easter_egg,
          isHidden: false,
          description: rawBubble.description,
          projects: Array.isArray(rawBubble.projects) ? rawBubble.projects : (rawBubble.projects ? JSON.parse(rawBubble.projects) : []),
          isPopped: false,
          isVisited: false,
          size: bubbleSize,
          color: rawBubble.color || '#3b82f6'
        } satisfies Bubble
      })
      
      console.log('✅ Bubbles loaded successfully:', bubbles.value.length)
    } catch (e) {
      console.error('❌ Error loading bubbles:', e)
      error.value = e instanceof Error ? e.message : 'Failed to load bubbles'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const getBubblesByYear = (year: number): Bubble[] => {
    return bubbles.value.filter(bubble => bubble.yearStarted === year)
  }

  const popBubble = (id: string) => {
    const bubble = bubbles.value.find(b => b.id === id)
    if (bubble) {
      bubble.isPopped = true
    }
  }

  const resetBubbles = () => {
    bubbles.value = bubbles.value.map(bubble => ({
      ...bubble,
      isPopped: false
    }))
  }

  const incrementToughBubbleClicks = (id: string): { isReady: boolean, currentClicks: number, requiredClicks: number, clicksLeft: number, bonusXP: number } => {
    const bubble = bubbles.value.find(b => b.id === id)
    if (!bubble || !bubble.isTough) {
      return { isReady: false, currentClicks: 0, requiredClicks: 1, clicksLeft: 1, bonusXP: 0 }
    }

    // Инициализируем значения если их нет
    if (bubble.currentClicks === undefined) {
      bubble.currentClicks = 0
    }
    if (bubble.toughClicks === undefined) {
      bubble.toughClicks = 3 // дефолтное значение
    }

    bubble.currentClicks++
    
    const isReady = bubble.currentClicks >= bubble.toughClicks
    const clicksLeft = Math.max(0, bubble.toughClicks - bubble.currentClicks)
    const bonusXP = isReady ? 5 : 0 // Бонус XP за разрушение крепкого пузыря
    
    return {
      isReady,
      currentClicks: bubble.currentClicks,
      requiredClicks: bubble.toughClicks,
      clicksLeft,
      bonusXP
    }
  }

  return {
    bubbles,
    isLoading,
    error,
    loadBubbles,
    getBubblesByYear,
    popBubble,
    resetBubbles,
    incrementToughBubbleClicks
  }
}) 