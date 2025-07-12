import type { BubbleNode } from '@/types/canvas'
import type { NormalizedBubble } from '@/types/normalized'

const defaultBubbleNode: BubbleNode = {
    id: 0,
    name: '',
    year: 2015,
    skillLevel: 'intermediate',
    description: '',
    isPopped: false,
    isTough: false,
    isHidden: false,
    isQuestion: false,
    size: 'medium',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0,
    baseRadius: 0,
    targetRadius: 0,
    currentRadius: 0,
    oscillationPhase: 0,
    isHovered: false,
    isActive: false,
    isVisited: false,
    isReady: false,
  };

export const createBubble = (partial: Partial<BubbleNode>): BubbleNode => ({
  ...defaultBubbleNode,
  ...partial
})

export const normalizedToBubbleNode = (normalized: NormalizedBubble): BubbleNode => ({
  ...defaultBubbleNode,
  ...normalized
})

export function createHiddenBubble(): BubbleNode {
  return {
    ...defaultBubbleNode,
    id: Date.now(),
    name: 'Скрытый пузырь',
    isHidden: true,
    description: 'Этот пузырь почти невидим. Найдите его!',
    isPopped: false,
    size: 'small',
    x: Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2,
    y: Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.2
  }
}

export const getBubblesUpToYear = <T extends NormalizedBubble | BubbleNode>(
  bubbles: T[],
  year: number,
  visitedBubbleIds: number[] = []
): T[] =>
  bubbles.filter(b => 
    b.year <= year &&
    !b.isHidden &&
    !b.isQuestion &&
    !b.isPopped &&
    !visitedBubbleIds.includes(b.id)
  )

export const getBubblesToRender = (
  bubbles: NormalizedBubble[],
  currentYear: number,
  visited: number[],
  activeHiddenBubbles: BubbleNode[] = []
): BubbleNode[] => {
  const filtered = getBubblesUpToYear(bubbles, currentYear, visited)
  return [...filtered.map(normalizedToBubbleNode), ...(activeHiddenBubbles || [])]
}

export const findNextYearWithNewBubbles = (
  bubbles: NormalizedBubble[],
  currentYear: number,
  visited: number[]
): number => {
  const years = [...new Set(bubbles
    .filter(b => !b.isHidden && !b.isQuestion)
    .map(b => b.year))].sort((a, b) => a - b)

  for (const year of years) {
    if (year <= currentYear) continue
    const hasUnvisited = bubbles.some(b =>
      b.year === year &&
      !b.isHidden &&
      !b.isQuestion &&
      !b.isPopped &&
      !visited.includes(b.id)
    )
    if (hasUnvisited) return year
  }

  return currentYear
}
