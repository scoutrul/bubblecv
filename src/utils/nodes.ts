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

export const normalizedToBubbleNode = (normalized: NormalizedBubble): BubbleNode => ({
  ...defaultBubbleNode,
  ...normalized
})

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
  // Фильтруем обычные пузыри (не скрытые, не вопросы)
  const filtered = getBubblesUpToYear(bubbles, currentYear, visited)
  
  // Добавляем скрытые пузыри из bubbleStore
  const hiddenBubbles = bubbles
    .filter(b => b.isHidden && b.year <= currentYear && !visited.includes(b.id))
    .map(normalizedToBubbleNode)
  
  return [...filtered.map(normalizedToBubbleNode), ...hiddenBubbles, ...(activeHiddenBubbles || [])]
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
