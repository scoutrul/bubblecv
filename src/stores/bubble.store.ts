import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { NormalizedBubble } from '@/types/normalized'
import { GAME_CONFIG } from '@/config'
import { api } from '@/api'
import { createHiddenBubble } from '@/utils'
import { useSessionStore } from './session.store'


export const useBubbleStore = defineStore('bubbleStore', () => {
  const bubbles = ref<NormalizedBubble[]>([])
  const isLoading = ref(true)
  
  // Отслеживаем изменения уровня и перезагружаем баблы при необходимости
  const sessionStore = useSessionStore()
  watch(() => sessionStore.currentLevel, (newLevel, oldLevel) => {
    if (newLevel !== oldLevel) {
      console.log(`🔄 Уровень изменился с ${oldLevel} на ${newLevel}, перезагружаем баблы...`)
      loadBubbles()
    }
  })
  
  const loadBubbles = async () => {
    isLoading.value = true

    try {
      const currentLevel = sessionStore.currentLevel
      
      const { data } = currentLevel <= 1 
        ? await api.getBubbles()
        : await api.getProjectBubbles()
      
      console.log(`📊 Загружено ${data.length} баблов для уровня ${currentLevel}`)
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
