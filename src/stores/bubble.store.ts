import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BubbleNode } from '@/types/canvas'

export const useBubbleStore = defineStore('bubbleStore', () => {
  const bubbles = ref<BubbleNode[]>([])

  return {
    bubbles,
  }
})
