import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Bubble, SkillLevel, BubbleSize } from '../../../shared/types'
import { SKILL_LEVEL_API_MAPPING, SKILL_TO_BUBBLE_SIZE, SKILL_LEVELS, BUBBLE_SIZES } from '../../../shared/constants/skill-levels'
import { GAME_CONFIG } from '../../../shared/config/game-config'

export const useBubbleStore = defineStore('bubble', () => {
  const bubbles = ref<Bubble[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let loadingPromise: Promise<void> | null = null

  const loadBubbles = async (forceReload: boolean = false) => {
    // Если уже загружены и не принудительная перезагрузка - ничего не делаем
    if (bubbles.value.length > 0 && !forceReload) {
      return Promise.resolve()
    }
    
    // Если уже загружаем - возвращаем существующий промис
    if (loadingPromise) {
      return loadingPromise
    }

    isLoading.value = true
    error.value = null
    
    // Создаём промис для отслеживания загрузки
    loadingPromise = (async () => {
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
        
        // Добавляем первый скрытый пузырь, если его нет
        if (!bubbles.value.some(b => b.bubbleType === 'hidden')) {
          bubbles.value.push(createHiddenBubble(0))
        }
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to load bubbles'
        throw e
      } finally {
        isLoading.value = false
        loadingPromise = null // Очищаем промис после завершения
      }
    })()
    
    return loadingPromise
  }

  const getBubblesByYear = (year: number): Bubble[] => {
    return bubbles.value.filter(bubble => bubble.yearStarted === year)
  }

  // Новый метод: получить все пузыри до указанного года включительно (накопительно)
  const getBubblesUpToYear = (year: number, visitedBubbleIds: string[] = []): Bubble[] => {
    return bubbles.value.filter(bubble => {
      // Пузыри должны быть из года <= текущему году
      const isInTimeRange = bubble.yearStarted <= year
      // Исключаем уже посещённые пузыри
      const isNotVisited = !visitedBubbleIds.includes(bubble.id)
      // Исключаем лопнувшие пузыри
      const isNotPopped = !bubble.isPopped
      
      return isInTimeRange && isNotVisited && isNotPopped
    })
  }

  // Найти следующий год с новыми пузырями
  const findNextYearWithNewBubbles = (currentYear: number, visitedBubbleIds: string[] = []): number | null => {
    // Получаем все годы, где есть пузыри
    const availableYears = [...new Set(bubbles.value.map(bubble => bubble.yearStarted))].sort((a, b) => a - b)
    
    // Ищем следующий год после текущего, где есть новые (не посещённые) пузыри
    for (const year of availableYears) {
      if (year > currentYear) {
        const newBubblesInYear = bubbles.value.filter(bubble => {
          const isInYear = bubble.yearStarted === year
          const isNotVisited = !visitedBubbleIds.includes(bubble.id)
          const isNotPopped = !bubble.isPopped
          return isInYear && isNotVisited && isNotPopped
        })
        
        if (newBubblesInYear.length > 0) {
          return year
        }
      }
    }
    
    return null
  }

  const popBubble = (id: string) => {
    const bubble = bubbles.value.find(b => b.id === id)
    if (bubble) {
      bubble.isPopped = true
    }

    // После лопания пузыря, если число лопнувших кратно 10, добавляем новый скрытый пузырь
    const poppedCount = bubbles.value.filter(b => b.isPopped && b.bubbleType !== 'hidden').length
    if (poppedCount > 0 && poppedCount % 10 === 0) {
      const hiddenCount = bubbles.value.filter(b => b.bubbleType === 'hidden').length
      bubbles.value.push(createHiddenBubble(hiddenCount))
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

  // Генерация скрытого пузыря
  function createHiddenBubble(index: number = 0): Bubble {
    return {
      id: `hidden-bubble-${index}`,
      name: 'Скрытый пузырь',
      skillLevel: SKILL_LEVELS.NOVICE,
      yearStarted: 2000, // вне зависимости от года
      isActive: true,
      isEasterEgg: false,
      isHidden: true,
      description: 'Этот пузырь почти невидим. Найдите его!',
      projects: [],
      isPopped: false,
      isVisited: false,
      size: BUBBLE_SIZES.NOVICE,
      color: '#64748B11',
      bubbleType: 'hidden'
    } as Bubble & { bubbleType: 'hidden' }
  }

  return {
    bubbles,
    isLoading,
    error,
    loadBubbles,
    getBubblesByYear,
    getBubblesUpToYear,
    findNextYearWithNewBubbles,
    popBubble,
    resetBubbles,
    incrementToughBubbleClicks
  }
}) 