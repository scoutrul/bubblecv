import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api'
import { GAME_CONFIG } from '@/config'
import type { BubbleNode } from '@/types/canvas'

import { createBubble, createHiddenBubble } from '@/utils/nodes'

export const useBubbleStore = defineStore('bubbleStore', () => {
  const bubbles = ref<BubbleNode[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let loadingPromise: Promise<void> | null = null
  const toughBubbleClicks = ref<Record<string, number>>({})
  
  const activeHiddenBubbles = computed(() => bubbles.value.filter((b: BubbleNode) => b.isHidden && !b.isPopped))

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
        const { data } = await api.getBubbles()
        
        // Трансформируем данные в правильный формат
        bubbles.value = data.map(createBubble)
        
        // Добавляем первый скрытый пузырь, если его нет
        if (!bubbles.value.some((b: BubbleNode) => b.isHidden)) {
          bubbles.value.push(createHiddenBubble())
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

  const incrementToughBubbleClicks = (bubbleId: BubbleNode['id']): { currentClicks: number; isReady: boolean } => {
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

  return {
    bubbles,
    isLoading,
    error,
    activeHiddenBubbles,
    loadBubbles,
    incrementToughBubbleClicks,
  }
}) 