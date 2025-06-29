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
      // Фильтрация по году
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

  const getBubblesByCategory = computed(() => (category: string) =>
    bubbles.value.filter(bubble => bubble.category === category)
  )

  const getBubbleById = computed(() => (id: string) =>
    bubbles.value.find(bubble => bubble.id === id)
  )

  // Actions
  const loadBubbles = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('/api/bubbles')
      const data: ApiResponse<any[]> = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Ошибка загрузки пузырей')
      }

      // Трансформируем данные из API в нужный формат
      bubbles.value = (data.data || []).map((bubble: any) => ({
        ...bubble,
        yearStarted: bubble.year_started,
        yearEnded: bubble.year_ended || undefined,
        skillLevel: bubble.skill_level,
        isActive: Boolean(bubble.is_active),
        isEasterEgg: Boolean(bubble.is_easter_egg)
      }))
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
    getBubblesByCategory,
    getBubbleById,
    
    // Actions
    loadBubbles,
    seedData,
    addBubble,
    updateBubble,
    removeBubble,
    clearError
  }
}) 