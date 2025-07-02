import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Bubble, SkillLevel, BubbleSize } from '@shared/types'
import { SKILL_LEVEL_MIGRATION_MAP, SKILL_TO_BUBBLE_SIZE, SKILL_LEVELS, BUBBLE_SIZES } from '@shared/constants/skill-levels'
import { api } from '@shared/api'
import { GAME_CONFIG } from '@shared/config/game-config'

export const useBubbleStore = defineStore('bubble', () => {
  const bubbles = ref<Bubble[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let loadingPromise: Promise<void> | null = null
  const toughBubbleClicks = ref<Record<string, number>>({})
  
  const activeHiddenBubbles = computed(() => {
    return bubbles.value.filter(b => b.bubbleType === 'hidden' && !b.isPopped && !b.isVisited)
  })

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
        // Загружаем данные с сервера через API клиент
        const data = await api.getBubbles()
        
        // Трансформируем данные в правильный формат
        bubbles.value = data.data.map((rawBubble: any) => {
          // Преобразуем уровень навыка
          const skillLevel = SKILL_LEVEL_MIGRATION_MAP[rawBubble.skillLevel as keyof typeof SKILL_LEVEL_MIGRATION_MAP] || SKILL_LEVELS.NOVICE
          const bubbleSize: BubbleSize = SKILL_TO_BUBBLE_SIZE[skillLevel]
          
          return {
            id: rawBubble.id,
            name: rawBubble.name,
            skillLevel,
            year: rawBubble.year,
            isActive: rawBubble.isActive,
            isEasterEgg: rawBubble.isEasterEgg,
            isHidden: false,
            description: rawBubble.description,
            projects: Array.isArray(rawBubble.projects) ? rawBubble.projects : (rawBubble.projects ? JSON.parse(rawBubble.projects) : []),
            isPopped: false,
            isVisited: false,
            size: bubbleSize,
            color: rawBubble.color || '#3b82f6',
            isTough: rawBubble.isTough || false,
            toughClicks: rawBubble.toughClicks || 0,
            currentClicks: 0,
            link: rawBubble.link || ''
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
    return bubbles.value.filter(bubble => bubble.year === year)
  }

  // Модифицируем метод getBubblesUpToYear
  const getBubblesUpToYear = (year: number, visitedBubbleIds: string[] = []): Bubble[] => {
    // Этот метод теперь работает ТОЛЬКО с обычными пузырями
    return bubbles.value.filter(bubble => {
      if (bubble.bubbleType === 'hidden') return false // Игнорируем скрытые пузыри

      const isInTimeRange = bubble.year <= year
      const isNotVisited = !visitedBubbleIds.includes(bubble.id)
      const isNotPopped = !bubble.isPopped
      
      return isInTimeRange && isNotVisited && isNotPopped
    })
  }

  // Найти следующий год с новыми пузырями
  const findNextYearWithNewBubbles = (currentYear: number, visitedBubbleIds: string[] = []): number | null => {
    const availableYears = [...new Set(
      bubbles.value
        .filter(bubble => !bubble.bubbleType || bubble.bubbleType !== 'hidden')
        .map(bubble => bubble.year)
    )].sort((a, b) => a - b)
    
    for (const year of availableYears) {
      if (year > currentYear) {
        const newBubblesInYear = bubbles.value.filter(bubble => {
          const isInYear = bubble.year === year
          const isNotVisited = !visitedBubbleIds.includes(bubble.id)
          const isNotPopped = !bubble.isPopped
          const isNotHidden = !bubble.bubbleType || bubble.bubbleType !== 'hidden'
          return isInYear && isNotVisited && isNotPopped && isNotHidden
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
  }

  const resetBubbles = () => {
    bubbles.value = bubbles.value.map(bubble => ({
      ...bubble,
      isPopped: false
    }))
  }

  const incrementToughBubbleClicks = (bubbleId: string): { currentClicks: number; isReady: boolean } => {
    if (!toughBubbleClicks.value[bubbleId]) {
      toughBubbleClicks.value[bubbleId] = 0
    }
    toughBubbleClicks.value[bubbleId]++

    const requiredClicks = GAME_CONFIG.TOUGH_BUBBLE_CLICKS_REQUIRED

    return {
      currentClicks: toughBubbleClicks.value[bubbleId],
      isReady: toughBubbleClicks.value[bubbleId] >= requiredClicks
    }
  }

  const getToughBubbleClicks = (bubbleId: string): number => {
    return toughBubbleClicks.value[bubbleId] || 0
  }

  // Генерация скрытого пузыря
  function createHiddenBubble(index: number = 0): Bubble {
    const hiddenBubble: Bubble = {
      id: `hidden-bubble-${Date.now()}-${index}`, // Добавляем timestamp для уникальности
      name: 'Скрытый пузырь',
      skillLevel: SKILL_LEVELS.NOVICE,
      year: 2000, // вне зависимости от года
      isActive: true,
      isEasterEgg: false,
      isHidden: true,
      description: 'Этот пузырь почти невидим. Найдите его!',
      projects: [],
      isPopped: false,
      isVisited: false,
      // Убираем временную метку
      size: BUBBLE_SIZES.NOVICE,
      color: '#64748B99', // Увеличиваем непрозрачность для лучшей видимости
      bubbleType: 'hidden',
      isTough: false,
      toughClicks: 0,
      currentClicks: 0,
      x: Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2,
      y: Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.2
    } as Bubble & { bubbleType: 'hidden' }
    return hiddenBubble
  }

  const addHiddenBubble = () => {
    const totalHiddenCount = bubbles.value.filter(b => b.bubbleType === 'hidden').length;
    const newHiddenBubble = createHiddenBubble(totalHiddenCount);
    bubbles.value = [...bubbles.value, newHiddenBubble];
  };

  // Добавляем метод для проверки наличия непробитых пузырей в году (исключая скрытые)
  const hasUnpoppedBubblesInYear = (year: number): boolean => {
    return bubbles.value.some(bubble => 
      bubble.year === year && 
      !bubble.isPopped && 
      (!bubble.bubbleType || bubble.bubbleType !== 'hidden')
    )
  }

  const reset = () => {
    bubbles.value = []
    isLoading.value = false
    error.value = null
    loadingPromise = null
    toughBubbleClicks.value = {}
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
    incrementToughBubbleClicks,
    hasUnpoppedBubblesInYear,
    activeHiddenBubbles,
    addHiddenBubble,
    getToughBubbleClicks,
    reset
  }
}) 