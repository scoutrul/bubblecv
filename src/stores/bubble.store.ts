import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BubbleNode } from '@/types/canvas'
import { api } from '@/api'


export const useBubbleStore = defineStore('bubbleStore', () => {
  const bubbles = ref<BubbleNode[]>([])
  const isLoading = ref(true)
  
  const loadBubbles = async () => {
    isLoading.value = true

    try {
      const { data } = await api.getBubbles()
      bubbles.value = data
    } catch (err) {
      console.error('❌ Ошибка загрузки уровней:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    bubbles,
  }
})
