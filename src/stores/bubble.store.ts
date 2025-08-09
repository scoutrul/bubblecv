import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { NormalizedBubble } from '@/types/normalized'
import { GAME_CONFIG } from '@/config'
import { api } from '@/api'
import { createHiddenBubble } from '@/utils'
import { useSessionStore } from './session.store'
import { GameModeUseCaseFactory } from '@/usecases/game-mode'
import { getYearRange } from '@/utils'


export const useBubbleStore = defineStore('bubbleStore', () => {
  const bubbles = ref<NormalizedBubble[]>([])
  const isLoading = ref(true)
  // Очередь пузырей для добавления при удалении
  const bubbleQueue = ref<NormalizedBubble[]>([])
  
  // Category filter state
  const selectedCategories = ref<string[]>([])
  const isCategoryFilterPanelOpen = ref(false)
  
  // Отслеживаем изменения уровня и перезагружаем баблы при необходимости
  const sessionStore = useSessionStore()
  watch(() => sessionStore.currentLevel, (newLevel, oldLevel) => {
    if (newLevel !== oldLevel) {
      console.log(`🔄 Уровень изменился с ${oldLevel} на ${newLevel}, перезагружаем баблы...`)
      loadBubbles()
    }
  })
  
  // Функция для получения следующего пузыря из очереди
  const getNextBubbleFromQueue = (): NormalizedBubble | null => {
    if (bubbleQueue.value.length === 0) return null
    return bubbleQueue.value.shift() || null
  }
  
  // Функция для обновления очереди пузырей
  const updateBubbleQueue = (currentYear: number, visited: number[]) => {
    const allAvailableBubbles = bubbles.value.filter(b => 
      b.year <= currentYear && 
      !b.isHidden && 
      !b.isQuestion && 
      !b.isPopped && 
      !visited.includes(b.id)
    ).sort((a, b) => {
      // Приоритет 1: пузыри текущего года
      if (a.year === currentYear && b.year !== currentYear) return -1
      if (b.year === currentYear && a.year !== currentYear) return 1
      
      // Приоритет 2: пузыри текущего года сортируются по ID (порядок в данных)
      if (a.year === currentYear && b.year === currentYear) {
        return a.id - b.id
      }
      
      // Приоритет 3: предыдущие годы сортируются по убыванию (новые → старые)
      return b.year - a.year
    })
    
    // Оставляем только те пузыри, которые не помещаются на экран
          const normalCapacity = Math.max(0, GAME_CONFIG.MAX_BUBBLES_ON_SCREEN() - GAME_CONFIG.PHILOSOPHY_BUBBLES_ON_SCREEN_MAX)
          bubbleQueue.value = allAvailableBubbles.slice(normalCapacity)
  }
  
  const loadBubbles = async () => {
    isLoading.value = true

    try {
      const currentLevel = sessionStore.currentLevel
      
      // Используем use case для определения режима
      const gameModeUseCaseFactory = new GameModeUseCaseFactory(sessionStore)
      const getGameModeUseCase = gameModeUseCaseFactory.createGetGameModeUseCase()
      const result = getGameModeUseCase.execute({ currentLevel })
      
      // Загружаем данные в зависимости от режима
      const { data } = result.isCareerMode 
        ? await api.getBubbles()
        : await api.getProjectBubbles()
       bubbles.value = data

       // Если разблокирован крепкий пузырь, гарантируем наличие скрытых пузырей для всех лет до текущего
       if (sessionStore.hasUnlockedFirstToughBubbleAchievement) {
         const yearRange = getYearRange(bubbles.value)
         const startYear = yearRange.startYear
         const endYear = sessionStore.currentYear
         for (let year = startYear; year <= endYear; year++) {
           const existingHidden = bubbles.value.find(b => b.isHidden && b.year === year)
           const hiddenId = -(year * 10000 + 9999)
           const isPopped = sessionStore.visitedBubbles.includes(hiddenId)
           if (!existingHidden && !isPopped) {
             bubbles.value.push(createHiddenBubble(year))
           }
         }
       }
      
      // Обновляем очередь пузырей после загрузки
      updateBubbleQueue(sessionStore.currentYear, sessionStore.visitedBubbles)
    } catch (err) {
      console.error('❌ Ошибка загрузки пузырей:', err)
    } finally {
      isLoading.value = false
    }
  }

  const incrementToughBubbleClicks = (bubbleId: number) => {
    const bubble = bubbles.value.find(b => b.id === bubbleId)
    if (!bubble || !bubble.isTough) return { isReady: false, clicks: 0, required: 0 }
    
    bubble.toughClicks = (bubble.toughClicks || 0) + 1
    
    // Устанавливаем случайное количество кликов при первом клике
    if (!bubble.requiredClicks) {
      bubble.requiredClicks = GAME_CONFIG.TOUGH_BUBBLE_CLICKS_REQUIRED()
    }
    
    const isReady = bubble.toughClicks >= bubble.requiredClicks
    return { isReady, clicks: bubble.toughClicks, required: bubble.requiredClicks }
  }

  const incrementHiddenBubbleClicks = (bubbleId: number) => {
    const bubble = bubbles.value.find(b => b.id === bubbleId)
    if (!bubble || !bubble.isHidden) return { isReady: false, clicks: 0, required: 0 }
    
    bubble.hiddenClicks = (bubble.hiddenClicks || 0) + 1
    
    // Устанавливаем случайное количество кликов при первом клике
    if (!bubble.requiredHiddenClicks) {
      bubble.requiredHiddenClicks = GAME_CONFIG.HIDDEN_BUBBLE_CLICKS_REQUIRED()
    }
    
    const isReady = bubble.hiddenClicks >= bubble.requiredHiddenClicks
    return { isReady, clicks: bubble.hiddenClicks, required: bubble.requiredHiddenClicks }
  }

  const addHiddenBubbles = (years: number[]) => {
    years.forEach(year => {
      // Проверяем, нет ли уже скрытого пузыря для этого года
      const existingHiddenBubble = bubbles.value.find(b => 
        b.isHidden && b.year === year
      )
      
      if (!existingHiddenBubble) {
        const hiddenBubble = createHiddenBubble(year)
        bubbles.value.push(hiddenBubble)
      }
    })
  }

  // Category filter methods
  const toggleCategory = (categoryId: string) => {
    const index = selectedCategories.value.indexOf(categoryId)
    if (index > -1) {
      selectedCategories.value.splice(index, 1)
    } else {
      selectedCategories.value.push(categoryId)
    }
  }

  const resetCategoryFilters = () => {
    selectedCategories.value = []
  }

  const toggleCategoryFilterPanel = () => {
    isCategoryFilterPanelOpen.value = !isCategoryFilterPanelOpen.value
  }

  const closeCategoryFilterPanel = () => {
    isCategoryFilterPanelOpen.value = false
  }

  const hasActiveCategoryFilters = computed(() => selectedCategories.value.length > 0)
  const activeCategoryFilterCount = computed(() => selectedCategories.value.length)

  return {
    bubbles,
    isLoading,
    bubbleQueue,
    loadBubbles,
    incrementToughBubbleClicks,
    incrementHiddenBubbleClicks,
    addHiddenBubbles,
    getNextBubbleFromQueue,
    updateBubbleQueue,
    
    // Category filter state
    selectedCategories,
    isCategoryFilterPanelOpen,
    hasActiveCategoryFilters,
    activeCategoryFilterCount,
    
    // Category filter methods
    toggleCategory,
    resetCategoryFilters,
    toggleCategoryFilterPanel,
    closeCategoryFilterPanel
  }
})
