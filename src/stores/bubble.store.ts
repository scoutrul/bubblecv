import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NormalizedBubble } from '@/types/normalized'
import { GAME_CONFIG } from '@/config'
import { api } from '@/api'
import { createHiddenBubble } from '@/utils'


export const useBubbleStore = defineStore('bubbleStore', () => {
  const bubbles = ref<NormalizedBubble[]>([])
  const isLoading = ref(true)
  
  const loadBubbles = async () => {
    isLoading.value = true

    try {
      const { data } = await api.getBubbles()
      bubbles.value = data
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

  return {
    bubbles,
    isLoading,
    loadBubbles,
    incrementToughBubbleClicks,
    incrementHiddenBubbleClicks,
    addHiddenBubbles
  }
})
