import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Bubble, ApiResponse } from '../../../shared/types'
import { useSessionStore } from '../../user-session/model/session-store'

export const useBubbleStore = defineStore('bubble', () => {
  // State
  const bubbles = ref<Bubble[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeBubbles = computed(() => 
    bubbles.value.filter(bubble => bubble.isActive)
  )

  const easterEggBubbles = computed(() => 
    bubbles.value.filter(bubble => bubble.isEasterEgg)
  )

  const getBubblesByYear = computed(() => (year: number) => {
    const sessionStore = useSessionStore()
    const visitedBubbleIds = sessionStore.visitedBubbles
    
    return bubbles.value.filter(bubble => {
      // Скрытые пузыри всегда включаем (независимо от года)
      if (bubble.isHidden) {
        const isNotVisited = !visitedBubbleIds.includes(bubble.id)
        console.log('🕵️ Hidden bubble:', {
          id: bubble.id,
          name: bubble.name,
          isNotVisited
        })
        return isNotVisited
      }
      
      // Фильтрация по году для обычных пузырей
      const isInYear = bubble.yearStarted <= year && 
        (bubble.yearEnded === undefined || bubble.yearEnded >= year)
      
      // Исключаем посещенные пузыри
      const isNotVisited = !visitedBubbleIds.includes(bubble.id)
      
      console.log('🔍 Filter bubble:', {
        id: bubble.id,
        name: bubble.name,
        year,
        isInYear,
        isNotVisited,
        visitedBubbleIds: visitedBubbleIds.length
      })
      
      return isInYear && isNotVisited
    })
  })

  const getBubbleById = computed(() => (id: string) =>
    bubbles.value.find(bubble => bubble.id === id)
  )

  // Actions
  const loadBubbles = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Загружаем данные из локального JSON файла
      const mockData = await import('../../../shared/data/mockData.json')
      const rawBubbles = mockData.default.bubbles || []
      
      // Трансформируем данные в нужный формат
      bubbles.value = rawBubbles.map((bubble: any, index: number) => {
        // Каждый пятый пузырь (не easter egg и не hidden) делаем "крепким"
        const isTough = (index + 1) % 5 === 0 && !bubble.isEasterEgg && !bubble.isHidden
        const toughClicks = isTough ? Math.floor(Math.random() * 16) + 5 : undefined // 5-20 кликов
        
        if (isTough) {
          console.log('💪 Создан крепкий пузырь:', {
            id: bubble.id,
            name: bubble.label || bubble.name,
            toughClicks
          })
        }
        
        return {
          id: bubble.id,
          name: bubble.label || bubble.name,
          skillLevel: bubble.level || bubble.skillLevel,
          yearStarted: bubble.year || bubble.yearStarted,
          yearEnded: bubble.yearEnded,
          isActive: true,
          isEasterEgg: bubble.isEasterEgg || false,
          isHidden: bubble.isHidden || false,
          isTough,
          toughClicks,
          currentClicks: 0,
          description: bubble.description || '',
          projects: [], // Добавляем обязательное поле
          link: bubble.projectLink || bubble.link || '',
          size: bubble.size || 'medium',
          color: bubble.color || '#3b82f6'
        }
      }) as Bubble[]
      
      console.log('📁 Загружены пузыри из локального файла:', bubbles.value.length)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
      console.error('Ошибка загрузки пузырей:', err)
    } finally {
      isLoading.value = false
    }
  }

  const seedData = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data: ApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Ошибка загрузки данных')
      }

      // Перезагружаем пузыри после seeding
      await loadBubbles()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
      console.error('Ошибка загрузки данных:', err)
    } finally {
      isLoading.value = false
    }
  }

  const addBubble = (bubble: Bubble): void => {
    bubbles.value.push(bubble)
  }

  const updateBubble = (id: string, updates: Partial<Bubble>): void => {
    const index = bubbles.value.findIndex(bubble => bubble.id === id)
    if (index !== -1) {
      bubbles.value[index] = { ...bubbles.value[index], ...updates }
    }
  }

  const removeBubble = (id: string): void => {
    const index = bubbles.value.findIndex(bubble => bubble.id === id)
    if (index !== -1) {
      bubbles.value.splice(index, 1)
    }
  }

  const incrementToughBubbleClicks = (bubbleId: string): { isReady: boolean; clicksLeft: number; bonusXP: number } => {
    const bubble = bubbles.value.find(b => b.id === bubbleId)
    
    if (!bubble || !bubble.isTough) {
      return { isReady: false, clicksLeft: 0, bonusXP: 0 }
    }
    
    bubble.currentClicks = (bubble.currentClicks || 0) + 1
    
    const isReady = bubble.currentClicks >= (bubble.toughClicks || 0)
    const clicksLeft = Math.max(0, (bubble.toughClicks || 0) - bubble.currentClicks)
    const bonusXP = bubble.currentClicks // Каждый клик = +1 XP
    
    console.log('💪 Клик по крепкому пузырю:', {
      bubbleId,
      currentClicks: bubble.currentClicks,
      toughClicks: bubble.toughClicks,
      clicksLeft,
      isReady,
      bonusXP
    })
    
    return { isReady, clicksLeft, bonusXP }
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    bubbles,
    isLoading,
    error,
    
    // Getters
    activeBubbles,
    easterEggBubbles,
    getBubblesByYear,
    getBubbleById,
    
    // Actions
    loadBubbles,
    seedData,
    addBubble,
    updateBubble,
    removeBubble,
    incrementToughBubbleClicks,
    clearError
  }
}) 