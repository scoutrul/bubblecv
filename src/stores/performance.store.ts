import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePerformanceStore = defineStore('performanceStore', () => {
  const fps = ref(60)
  const performanceLevel = ref(0)
  const starCount = ref(0)
  const activeNodes = ref(0)
  const showPerformancePanel = ref(true)
  const starCounts = ref({
    deepBg: 0,
    center: 0,
    bg: 0,
    fg: 0
  })

  const updatePerformanceInfo = (info: { fps: number; performanceLevel: number; starCount: number; activeNodes?: number }) => {
    fps.value = info.fps
    performanceLevel.value = info.performanceLevel
    starCount.value = info.starCount
    if (info.activeNodes !== undefined) {
      activeNodes.value = info.activeNodes
    }
  }

  const updateStarCounts = (counts: { deepBg: number; center: number; bg: number; fg: number }) => {
    starCounts.value = counts
  }

  const updateActiveNodes = (count: number) => {
    activeNodes.value = count
  }

  const togglePerformancePanel = () => {
    showPerformancePanel.value = !showPerformancePanel.value
  }

  return {
    fps,
    performanceLevel,
    starCount,
    activeNodes,
    showPerformancePanel,
    starCounts,
    updatePerformanceInfo,
    updateStarCounts,
    updateActiveNodes,
    togglePerformancePanel
  }
}) 