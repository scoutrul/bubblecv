import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Bubble, SkillLevel, BubbleSize } from '../../../shared/types'

// Маппинг старых уровней в новые
const skillLevelMap: Record<string, SkillLevel> = {
  'novice': 'beginner',
  'intermediate': 'intermediate',
  'confident': 'advanced',
  'expert': 'expert',
  'master': 'expert'
}

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
        // Преобразуем старый уровень в новый
        const skillLevel = skillLevelMap[rawBubble.skill_level] || 'beginner'
        const bubbleSize: BubbleSize = `bubble-${skillLevel}` as BubbleSize
        
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
          projects: rawBubble.projects ? JSON.parse(rawBubble.projects) : [],
          isPopped: false,
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

  return {
    bubbles,
    isLoading,
    error,
    loadBubbles,
    getBubblesByYear,
    popBubble,
    resetBubbles
  }
}) 