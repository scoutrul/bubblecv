import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NormalizedBubble } from '@/types/normalized'
import { api } from '@/api'


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
    if (!bubble || !bubble.isTough) return { isReady: false, clicks: 0 }
    
    bubble.toughClicks = (bubble.toughClicks || 0) + 1
    const isReady = bubble.toughClicks >= 3 // TODO: add config
    
    return { isReady, clicks: bubble.toughClicks }
  }

  return {
    bubbles,
    isLoading,
    loadBubbles,
    incrementToughBubbleClicks
  }
})
