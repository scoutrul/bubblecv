import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import { useBubbleStore } from '@/stores/bubble.store'
import { useSessionStore } from '@/stores/session.store'

import { useModals, setCanvasBridge } from '@/composables/useModals'
import { useGameMode } from '@/composables/useGameMode'
import { getBubblesToRender, findNextYearWithNewBubbles, normalizedToBubbleNode, createPhilosophyBubble } from '@/utils'
import { useSession } from '@/composables/useSession'
import { CanvasUseCaseFactory } from '@/usecases/canvas'
import { CategoryFilterUseCaseFactory } from '@/usecases/category-filter'
import type { BubbleNode } from '@/types/canvas'
import { getYearRange } from '@/utils'
import { GAME_CONFIG } from '@/config'
import { i18n } from '@/i18n'
import questions_ru from '@/data/questions.json'
import questions_en from '@/data/questions_en.json'
import type { Question } from '@/types/data'
import { useClickerStore } from '@/stores/clicker.store'

export function useCanvas(canvasRef: Ref<HTMLCanvasElement | null>, containerRef: Ref<HTMLElement | null>) {
  const bubbleStore = useBubbleStore()
  const sessionStore = useSessionStore()
  const clickerStore = useClickerStore()

  const sessionComposable = useSession()
  const { updateCurrentYear } = sessionComposable
  const { openLevelUpModal, openBubbleModal, openPhilosophyModal } = useModals()

  const yearRange = computed(() => getYearRange(bubbleStore.bubbles))
  const startYear = computed(() => yearRange.value.startYear)
  const endYear = computed(() => yearRange.value.endYear)

  const canvasWidth = ref(0)
  const canvasHeight = ref(0)

  const philosophyBubblesByYear = ref<Map<number, BubbleNode>>(new Map())
  const usedQuestionIds = ref<Set<string>>(new Set())

  const canvasUseCaseFactory = new CanvasUseCaseFactory(
    bubbleStore,
    sessionStore,
    {
      openLevelUpModal,
      openBubbleModal,
      openPhilosophyModal
    }
  )

  const canvasUseCase = ref<ReturnType<typeof canvasUseCaseFactory.createCanvasUseCase> | null>(null)
  const { isProjectMode, isRetroMode } = useGameMode()

  const updateCanvasBubbles = () => {
    // Skip normal updates during clicker mode, но разрешаем первичную отрисовку, если узлов нет
    if (clickerStore.isActive) {
      const existing = canvasUseCase.value?.getCurrentBubbles?.() || []
      if (existing.length > 0) return
    }

    if (!canvasUseCase.value || !canvasRef.value) return

    const normalCapacity = Math.max(0, GAME_CONFIG.MAX_BUBBLES_ON_SCREEN() - GAME_CONFIG.PHILOSOPHY_BUBBLES_ON_SCREEN_MAX)
    const initialBubbles = getBubblesToRender(
      bubbleStore.bubbles,
      sessionStore.currentYear,
      sessionStore.visitedBubbles,
      [],
      sessionStore.hasUnlockedFirstToughBubbleAchievement,
      normalCapacity,
      isProjectMode.value
    )

    // Apply category filtering if filters are active
    let filteredBubbles = initialBubbles
    if (bubbleStore.hasActiveCategoryFilters) {
      // Create adapter for bubbleStore to match CategoryFilterStore interface
      const categoryFilterAdapter = {
        selectedCategories: bubbleStore.selectedCategories,
        hasActiveFilters: bubbleStore.hasActiveCategoryFilters,
        availableCategories: [],
        isPanelOpen: bubbleStore.isCategoryFilterPanelOpen,
        activeFilterCount: bubbleStore.activeCategoryFilterCount,
        selectedCategoriesInfo: [],
        toggleCategory: bubbleStore.toggleCategory,
        resetFilters: bubbleStore.resetCategoryFilters,
        togglePanel: bubbleStore.toggleCategoryFilterPanel,
        closePanel: bubbleStore.closeCategoryFilterPanel,
        setSelectedCategories: () => { },
        setAvailableCategories: () => { },
        saveToLocalStorage: () => { },
        loadFromLocalStorage: () => { }
      }

      const factory = new CategoryFilterUseCaseFactory(categoryFilterAdapter)
      const applyFiltersUseCase = factory.createApplyFiltersUseCase(bubbleStore.bubbles)

      // Apply category filters to ALL bubbles first, then filter by year
      const filteredNormalized = applyFiltersUseCase.execute({
        bubbles: bubbleStore.bubbles,
        selectedCategories: bubbleStore.selectedCategories
      })

      // Now apply year and other filters to the category-filtered bubbles
      filteredBubbles = getBubblesToRender(
        filteredNormalized.filteredBubbles,
        sessionStore.currentYear,
        sessionStore.visitedBubbles,
        [],
        sessionStore.hasUnlockedFirstToughBubbleAchievement,
        normalCapacity,
        isProjectMode.value
      )

    }

  // В ретро-режиме не добавляем философские пузыри
    const extraBubbles: BubbleNode[] = []

    if (!isRetroMode.value) {
      // Вычисляем сколько места осталось для философских пузырей
      const remainingSlots = GAME_CONFIG.MAX_BUBBLES_ON_SCREEN() - filteredBubbles.length
      
      // Гарантированно добавляем философские пузыри (не меньше резерва)
      const philosophyBubbles: BubbleNode[] = []
      const maxPhilosophyToAdd = Math.min(GAME_CONFIG.PHILOSOPHY_BUBBLES_ON_SCREEN_MAX, Math.max(0, remainingSlots))

      if (isProjectMode.value) {
        // В режиме проекта не привязываемся к годам — заполняем слоты философии
        for (let slot = 0; slot < maxPhilosophyToAdd; slot++) {
          const virtualYear = GAME_CONFIG.initialYear + slot // уникальные ключи для Map
          const philosophyBubble = createPhilosophyBubbleForYear(virtualYear, true)
          if (philosophyBubble && !sessionStore.visitedBubbles.includes(philosophyBubble.id)) {
            philosophyBubbles.push(philosophyBubble)
          }
        }
      } else {
        // В режиме карьеры распределяем по годам до текущего года
        for (let year = startYear.value; year <= sessionStore.currentYear && philosophyBubbles.length < maxPhilosophyToAdd; year++) {
          const philosophyBubble = createPhilosophyBubbleForYear(year, true)
          if (philosophyBubble) {
            const isPopped = sessionStore.visitedBubbles.includes(philosophyBubble.id)
            if (!isPopped) {
              philosophyBubbles.push(philosophyBubble)
            }
          }
        }
      }
      extraBubbles.push(...philosophyBubbles)
    }

    const finalBubbles = [...filteredBubbles, ...extraBubbles]

    try {
      canvasUseCase.value.updateBubbles({ bubbles: finalBubbles })
    } catch (error) {
      // swallow
    }
  }

  const addBubblesToCanvas = (newBubbles: BubbleNode[]) => {
    if (!canvasUseCase.value || !canvasRef.value) return

    // Получаем текущие пузыри на канвасе
    const currentBubbles = canvasUseCase.value.getCurrentBubbles?.() || []

    // Добавляем новые пузыри к существующим
    const updatedBubbles = [...currentBubbles, ...newBubbles]

    try {
      canvasUseCase.value.updateBubbles({ bubbles: updatedBubbles })
    } catch (error) {
      // swallow
    }
  }

  const setBubblesOnCanvas = (newBubbles: BubbleNode[]) => {
    if (!canvasUseCase.value || !canvasRef.value) return
    try {
      canvasUseCase.value.updateBubbles({ bubbles: newBubbles })
    } catch (error) {
      // swallow
    }
  }

  // Unified watcher for all bubble updates (avoid deep reactivity to prevent physics reset on minor property changes)
  watch([
    () => bubbleStore.bubbles.length, // react on additions/removals/reloads only
    () => sessionStore.currentLevel,
    () => sessionStore.currentYear,
    () => sessionStore.visitedBubbles,
    () => bubbleStore.selectedCategories,
    () => bubbleStore.hasActiveCategoryFilters
  ], () => {
    nextTick(() => {
      if (clickerStore.isActive) return
      updateCanvasBubbles()
      // Обновляем очередь пузырей при изменении данных
      bubbleStore.updateBubbleQueue(sessionStore.currentYear, sessionStore.visitedBubbles)
    })
  }, { flush: 'post' })

  // Additional watcher specifically for category filter changes to ensure immediate updates
  watch(() => bubbleStore.selectedCategories.slice(), () => {
    nextTick(() => {
      if (clickerStore.isActive) return
      updateCanvasBubbles()
    })
  }, { flush: 'post' })

  watch(() => bubbleStore.hasActiveCategoryFilters, () => {
    nextTick(() => {
      if (clickerStore.isActive) return
      updateCanvasBubbles()
    })
  }, { flush: 'post' })

  // Дополнительный watcher для философских пузырей в project-режиме
  watch(() => sessionStore.visitedBubbles.slice(), () => {
    if (isProjectMode.value) {
      nextTick(() => {
        if (clickerStore.isActive) return
        updateCanvasBubbles()
      })
    }
  }, { flush: 'post' })

  const checkBubblesAndAdvance = (currentNodes: BubbleNode[]) => {
    const coreBubbles = currentNodes.filter(n => !n.isQuestion && !n.isHidden && !n.isPopped)
    const hasCoreBubbles = coreBubbles.length > 0

    if (!hasCoreBubbles && sessionStore.currentYear < endYear.value) {
      const nextYear = findNextYearWithNewBubbles(bubbleStore.bubbles, sessionStore.currentYear, sessionStore.visitedBubbles)
      if (nextYear !== null) {
        setTimeout(() => {
          updateCurrentYear(nextYear, true) // Включаем анимацию для автоматической смены года
        }, 300)
      }
    }
  }

  const resetCanvas = async () => {
    philosophyBubblesByYear.value.clear()
    usedQuestionIds.value.clear()
    updateCurrentYear(GAME_CONFIG.initialYear)
    await nextTick()
    setTimeout(() => {
      if (clickerStore.isActive) return
      updateCanvasBubbles()
    }, 100)
  }

  const createPhilosophyBubbleForYear = (year: number, forceCreate: boolean = false): BubbleNode | null => {
    if (philosophyBubblesByYear.value.has(year)) {
      const existingBubble = philosophyBubblesByYear.value.get(year)!
      if (sessionStore.visitedBubbles.includes(existingBubble.id)) {
        // Удаляем посещенный пузырь из слота, но НЕ освобождаем usedQuestionIds
        philosophyBubblesByYear.value.delete(year)
        // не возвращаемся, создадим новый сразу ниже
      } else {
        return existingBubble
      }
    }

    if (forceCreate || (!isProjectMode.value && Math.random() < 0.3) || (isProjectMode.value)) {
      type QuestionsFile = { questions: Question[] }
      const questions = ((i18n.locale.value === 'en' ? questions_en : questions_ru) as QuestionsFile).questions
      let availableQuestions = questions.filter((q: { id: string }) => !usedQuestionIds.value.has(q.id))

      // Если все вопросы использованы, сбрасываем список и начинаем заново (циклическое переиспользование)
      if (availableQuestions.length === 0) {
        usedQuestionIds.value.clear()
        availableQuestions = questions
      }

      if (availableQuestions.length > 0) {
        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]

        usedQuestionIds.value.add(randomQuestion.id)

        const philosophyBubble = createPhilosophyBubble(randomQuestion, year)
        const bubbleNode = normalizedToBubbleNode(philosophyBubble)

        philosophyBubblesByYear.value.set(year, bubbleNode)

        return bubbleNode
      }
    }

    return null
  }

  const removeBubble = async (bubbleId: number, xpAmount?: number, isPhilosophyNegative?: boolean) => {
    if (!canvasUseCase.value) return

    try {
      // Удаляем пузырь с эффектами
      await canvasUseCase.value.removeBubbleWithEffects({
        bubble: { id: bubbleId } as BubbleNode,
        xpAmount,
        isPhilosophyNegative
      })

      // Проверяем, есть ли пузыри в очереди для добавления
      const nextBubble = bubbleStore.getNextBubbleFromQueue()
      if (nextBubble) {
        const bubbleNode = normalizedToBubbleNode(nextBubble)
        addBubblesToCanvas([bubbleNode])
      }

      // Проверяем, нужно ли продвигать год
      const currentNodes = canvasUseCase.value.getCurrentBubbles?.() || []
      checkBubblesAndAdvance(currentNodes)
    } catch (error) {
      // swallow
    }
  }

  watch(() => sessionStore.currentYear, async (newYear) => {

    if (bubbleStore.isLoading || !canvasUseCase.value) {
      return
    }

    // Если год сброшен на начальный, очищаем философские пузыри
    if (newYear === GAME_CONFIG.initialYear) {
      philosophyBubblesByYear.value.clear()
      usedQuestionIds.value.clear()
    }

    // Добавляем скрытые пузыри в bubbleStore только если получена ачивка "крепыш" (не для ретро)
    if (sessionStore.hasUnlockedFirstToughBubbleAchievement && !isRetroMode.value) {
      const yearsToAdd: number[] = []
      for (let year = startYear.value; year <= newYear; year++) {
        // Проверяем, есть ли уже скрытый пузырь для этого года в bubbleStore
        const existingHiddenBubble = bubbleStore.bubbles.find(b => 
          b.isHidden && b.year === year
        )

        // Проверяем, не был ли этот пузырь уже лопнут
        const isPopped = sessionStore.visitedBubbles.includes(-(year * 10000 + 9999))

        if (!existingHiddenBubble && !isPopped) {
          yearsToAdd.push(year)
        }
      }

      if (yearsToAdd.length > 0) {
        bubbleStore.addHiddenBubbles(yearsToAdd)
      }
    }

    // Единое обновление пузырей (учитывает фильтры категорий и лимиты)
    if (!clickerStore.isActive) {
      updateCanvasBubbles()
    }

    // Проверяем нужно ли перейти к следующему году
    const currentNodes = canvasUseCase.value.getCurrentBubbles?.() || []
    checkBubblesAndAdvance(currentNodes)

  })

  onMounted(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvasWidth.value = width
        canvasHeight.value = height

        if (canvasRef.value) {
          canvasRef.value.width = width
          canvasRef.value.height = height

          // Проверяем, нужно ли переинициализировать canvas (например, при hot reload)
          const needsReinit = !canvasUseCase.value ||
            (canvasUseCase.value && !canvasUseCase.value.updateBubbles)

          if (!canvasUseCase.value || needsReinit) {
            // Уничтожаем старый use case если он существует
            if (canvasUseCase.value) {
              canvasUseCase.value.destroyCanvas()
            }

            // Создаем use case при первой инициализации или переинициализации
            canvasUseCase.value = canvasUseCaseFactory.createCanvasUseCase(canvasRef, sessionComposable, checkBubblesAndAdvance)

            // Инициализируем канвас
            canvasUseCase.value.initCanvas({ width, height, canvasRef })

            // Обновляем пузыри с небольшой задержкой
            setTimeout(() => {
              if (clickerStore.isActive) return
              updateCanvasBubbles()
            }, 50)
          } else {
            // Обновляем размеры существующего use case
            canvasUseCase.value.updateCanvasSize({ width, height })
          }
        }
      }
    })

    // Обработчик изменения размера окна
    const handleWindowResize = () => {
      if (containerRef.value && canvasRef.value) {
        const rect = containerRef.value.getBoundingClientRect()
        const width = rect.width
        const height = rect.height

        canvasWidth.value = width
        canvasHeight.value = height
        canvasRef.value.width = width
        canvasRef.value.height = height

        if (canvasUseCase.value) {
          canvasUseCase.value.updateCanvasSize({ width, height })
        }
      }
    }

    if (containerRef.value) {
      resizeObserver.observe(containerRef.value)
    }

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', handleWindowResize)

    // Обработчик для Vite HMR (Hot Module Replacement)
    if (import.meta.hot) {
      import.meta.hot.accept(() => {
        // Принудительно вызываем resize для переинициализации
        if (containerRef.value) {
          const event = new Event('resize')
          window.dispatchEvent(event)
        }
      })
    }

    onUnmounted(() => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleWindowResize)
      if (canvasUseCase.value) {
        canvasUseCase.value.destroyCanvas()
      }
    })
  })

  return {
    canvasWidth,
    canvasHeight,
    resetCanvas,
    removeBubble,
    addBubblesToCanvas,
    updateCanvasBubbles,
    removeBubbleWithEffects: async (params: { bubble: BubbleNode; xpAmount?: number; isPhilosophyNegative?: boolean; skipFloatingText?: boolean }) => {
      if (canvasUseCase.value) {
        await canvasUseCase.value.removeBubbleWithEffects(params)
      }
    },
    removePhilosophyBubble: (bubbleId: number) => {
      if (canvasUseCase.value) {
        return canvasUseCase.value.removePhilosophyBubble(bubbleId)
      }
    },
    findBubbleById: (bubbleId: number) => {
      if (canvasUseCase.value) {
        return canvasUseCase.value.findBubbleById(bubbleId)
      }
      return undefined
    },
    createFloatingText: (params: { x: number; y: number; text: string; type: 'xp' | 'life'; color?: string }) => {
      if (canvasUseCase.value) {
        canvasUseCase.value.createFloatingText(params)
      }
    },
    setBubblesOnCanvas
  }
}
