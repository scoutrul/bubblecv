import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api'
import { normalizedToBubbleNode, createPhilosophyBubble } from '@/utils'
import type { NormalizedBubble } from '@/types/normalized'
import type { BubbleNode } from '@/types/canvas'
import { GAME_CONFIG } from '@/config'
import { getCanvasBridge } from '@/composables/useModals'
import { useModalStore } from '@/stores/modal.store'
import questionsData from '@/data/questions.json'

export interface ClickerResultsData {
  score: number
  clicked: number
  total: number
  timeLeftMs: number
  bonus: number
  totalScore: number
}

export type ClickerFinishReason = 'timeout' | 'completed' | 'aborted'

export const useClickerStore = defineStore('clickerStore', () => {
  // State
  const isActive = ref(false)          // Active includes countdown and game runtime
  const isRunning = ref(false)         // Running means the 60s game is ticking
  const countdown = ref<number | null>(null) // 3 -> 2 -> 1 -> 0 (GO!) or null when not counting
  const timeLeftMs = ref(0)
  const gameEndAtMs = ref(0)

  const score = ref(0)
  const clicked = ref(0)
  const totalTargets = ref(0)
  const bestScore = ref(0)
  const xpScore = ref(0)

  // Bubble pool management
  const bubblePool = ref<NormalizedBubble[]>([])
  const poolIndex = ref(0)

  // Local tough clicks tracking for clicker mode (isolated from main store)
  const toughClicksById = ref<Map<number, number>>(new Map())

  // Handles
  let countdownTimeouts: number[] = []
  let rafId: number | null = null

  // Derived
  const timeLeftSecTenths = computed(() => {
    const ms = Math.max(0, timeLeftMs.value)
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const tenths = Math.floor((ms % 1000) / 100)
    return { minutes, seconds, tenths }
  })

  // Private helpers
  const clearCountdown = () => {
    countdownTimeouts.forEach(id => clearTimeout(id))
    countdownTimeouts = []
    countdown.value = null
  }

  const stopRaf = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const tick = () => {
    const now = performance.now()
    const remaining = Math.max(0, gameEndAtMs.value - now)
    timeLeftMs.value = remaining
    if (remaining <= 0) {
      finish('timeout')
      return
    }
    rafId = requestAnimationFrame(tick)
  }

  const computeResults = (): ClickerResultsData => {
    // Base score is accumulated XP (visual-only during clicker)
    const rawXp = xpScore.value
    // Time multiplier grows linearly with remaining time (up to +100% if finished instantly)
    const duration = GAME_CONFIG.clicker.DURATION_MS
    const multiplier = 1 + Math.max(0, timeLeftMs.value) / duration
    const totalScore = Math.round(rawXp * multiplier)
    const bonusAmount = Math.max(0, totalScore - rawXp)
    // update best
    if (totalScore > bestScore.value) bestScore.value = totalScore
    return {
      score: rawXp,
      clicked: clicked.value,
      total: totalTargets.value,
      timeLeftMs: timeLeftMs.value,
      bonus: bonusAmount,
      totalScore
    }
  }

  const pushInitialBubblesToCanvas = (initialCount: number) => {
    const canvas = getCanvasBridge()
    if (!canvas) return
    const selected = bubblePool.value.slice(poolIndex.value, poolIndex.value + initialCount)
    poolIndex.value += selected.length

    const nodes: BubbleNode[] = selected.map(n => normalizedToBubbleNode(n))
    canvas.updateCanvasBubbles && canvas.updateCanvasBubbles() // ensure canvas exists
    canvas.updateCanvasBubbles && canvas.updateCanvasBubbles() // noop double-call safeguard
    // Replace scene with initial clicker set to avoid duplicates and enforce capacity
    if ((canvas as { setBubblesOnCanvas?: (nodes: BubbleNode[]) => void }).setBubblesOnCanvas) {
      ;(canvas as { setBubblesOnCanvas?: (nodes: BubbleNode[]) => void }).setBubblesOnCanvas!(nodes)
    } else if ((canvas as { addBubblesToCanvas?: (nodes: BubbleNode[]) => void }).addBubblesToCanvas) {
      // Fallback in case setBubblesOnCanvas is not available
      ;(canvas as { addBubblesToCanvas?: (nodes: BubbleNode[]) => void }).addBubblesToCanvas!(nodes)
    } else {
      console.warn('Canvas bridge does not expose setBubblesOnCanvas/addBubblesToCanvas; initial bubbles may not render as expected')
    }
  }

  const addNextBubbleToCanvas = () => {
    const canvas = getCanvasBridge()
    if (!canvas) return
    if (poolIndex.value >= bubblePool.value.length) return
    const nb = bubblePool.value[poolIndex.value++]
    const node = normalizedToBubbleNode(nb)
    if ((canvas as { addBubblesToCanvas?: (nodes: BubbleNode[]) => void }).addBubblesToCanvas) {
      ;(canvas as { addBubblesToCanvas?: (nodes: BubbleNode[]) => void }).addBubblesToCanvas!([node])
    }
  }

  // Public API
  const openRules = () => {
    const modalStore = useModalStore()
    modalStore.enqueueModal({ type: 'clickerRules', data: null, priority: 60 })
  }

  const startCountdown = async () => {
    // Close rules quickly before starting
    const modalStore = useModalStore()
    modalStore.closeCurrentModal()

    isActive.value = true
    isRunning.value = false

    // Build pool
    const [skills, project] = await Promise.all([
      api.getBubbles(),
      api.getProjectBubbles()
    ])

    // Offset project IDs to avoid collisions
    const projectOffset = 10000
    const projectData: NormalizedBubble[] = project.data.map(p => ({
      ...p,
      id: p.id + projectOffset
    }))

    // Build philosophy visuals set (6 random questions)
    const questions = questionsData.questions || []
    const philosophyVisuals: NormalizedBubble[] = []
    const used = new Set<string>()
    const pickCount = Math.min(6, questions.length)
    while (philosophyVisuals.length < pickCount) {
      const idx = Math.floor(Math.random() * questions.length)
      const q = questions[idx]
      if (!q || used.has(q.id)) continue
      used.add(q.id)
      const ph = createPhilosophyBubble(q, GAME_CONFIG.initialYear)
      philosophyVisuals.push(ph)
    }

    // Build final pool: add skills + projects + philosophy visuals, only exclude hidden
    bubblePool.value = [...skills.data, ...projectData, ...philosophyVisuals]
      .filter(b => !b.isHidden)

    totalTargets.value = bubblePool.value.length
    poolIndex.value = 0
    toughClicksById.value.clear()

    // Start 3 -> 2 -> 1 -> 0 (GO!)
    countdown.value = 3
    countdownTimeouts.push(window.setTimeout(() => { countdown.value = 2 }, 1000))
    countdownTimeouts.push(window.setTimeout(() => { countdown.value = 1 }, 2000))
    countdownTimeouts.push(window.setTimeout(() => { countdown.value = 0 }, 3000))
    // During countdown, ensure bubble scene is empty to avoid pre-clicks
    const canvas = getCanvasBridge()
    if (canvas && (canvas as { setBubblesOnCanvas?: (nodes: BubbleNode[]) => void }).setBubblesOnCanvas) {
      ;(canvas as { setBubblesOnCanvas?: (nodes: BubbleNode[]) => void }).setBubblesOnCanvas!([])
    }
    countdownTimeouts.push(window.setTimeout(() => { startGame() }, 3500))
  }

  const startGame = () => {
    // Push initial bubbles to canvas
    const capacity = GAME_CONFIG.MAX_BUBBLES_ON_SCREEN()
    pushInitialBubblesToCanvas(capacity)

    isRunning.value = true
    const duration = GAME_CONFIG.clicker.DURATION_MS
    gameEndAtMs.value = performance.now() + duration
    timeLeftMs.value = duration
    stopRaf()
    rafId = requestAnimationFrame(tick)
  }

  const onBubblePopped = (bubbleId: number, isTough: boolean = false): boolean => {
    if (!isActive.value) return false

    if (isTough) {
      const current = toughClicksById.value.get(bubbleId) || 0
      const required = GAME_CONFIG.TOUGH_BUBBLE_CLICKS_REQUIRED()
      const next = current + 1
      if (next < required) {
        toughClicksById.value.set(bubbleId, next)
        return false // not popped yet
      }
      toughClicksById.value.delete(bubbleId)
    }

    // Count score and spawn next
    clicked.value += 1
    score.value += 1
    addNextBubbleToCanvas()

    // Early finish if all targets done
    if (clicked.value >= totalTargets.value) {
      finish('completed')
    }

    return true
  }

  const addXp = (amount: number) => {
    if (!isActive.value) return
    xpScore.value += Math.max(0, Math.round(amount))
  }

  const finish = (reason: ClickerFinishReason) => {
    stopRaf()
    clearCountdown()

    const wasRunning = isRunning.value
    isRunning.value = false
    const prevIsActive = isActive.value
    isActive.value = false

    // Restore normal canvas scene
    const canvas = getCanvasBridge()
    canvas && canvas.updateCanvasBubbles && canvas.updateCanvasBubbles()

    if (reason === 'aborted') {
      // No results modal
      // Reset internal state
      resetState()
      return
    }

    if (!wasRunning && prevIsActive) {
      // Countdown aborted before starting
      resetState()
      return
    }

    const results = computeResults()
    const modalStore = useModalStore()
    modalStore.enqueueModal({ type: 'clickerResults', data: results, priority: 65 })
  }

  const abort = () => {
    finish('aborted')
  }

  const clearTimers = () => {
    stopRaf()
    clearCountdown()
  }

  const resetState = () => {
    isActive.value = false
    isRunning.value = false
    countdown.value = null
    timeLeftMs.value = 0
    gameEndAtMs.value = 0
    score.value = 0
    clicked.value = 0
    totalTargets.value = 0
    bubblePool.value = []
    poolIndex.value = 0
    toughClicksById.value.clear()
  }

  return {
    // State
    isActive,
    isRunning,
    countdown,
    timeLeftMs,
    gameEndAtMs,
    score,
    clicked,
    totalTargets,
    bestScore,
    bubblePool,

    // Derived
    timeLeftSecTenths,

    // Actions
    openRules,
    startCountdown,
    startGame,
    onBubblePopped,
    finish,
    abort,
    clearTimers,
    resetState,
    addXp
  }
})
