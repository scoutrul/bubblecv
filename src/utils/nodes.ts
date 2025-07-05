import type { BubbleNode } from '@/types/canvas'

const defaultBubbleNode: BubbleNode = {
    id: 0,
    name: '',
    year: 2025,
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
  
  export const createBubble = (bubble: Partial<BubbleNode>): BubbleNode => ({
    ...defaultBubbleNode,
    ...bubble
  });


export function createHiddenBubble(): BubbleNode {
  const hiddenBubble: BubbleNode = {
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
  return hiddenBubble
}

export const getBubblesUpToYear = (bubbles: BubbleNode[], year: BubbleNode['year'], visitedBubbleIds: number[] = []): BubbleNode[] => {
  // Этот метод теперь работает ТОЛЬКО с обычными пузырями
  return bubbles.filter((bubble: BubbleNode) => {
    if (bubble.isHidden) return false // Игнорируем скрытые пузыри
    if (bubble.isQuestion) return false // Игнорируем скрытые пузыри

    const isInTimeRange = bubble.year <= year
    const isNotVisited = !visitedBubbleIds.includes(bubble.id)
    const isNotPopped = !bubble.isPopped
    
    return isInTimeRange && isNotVisited && isNotPopped
  })
}

export const getBubblesToRender = (bubbles: BubbleNode[], currentYear: BubbleNode['year'], visitedBubbles: number[] = [], activeHiddenBubbles: BubbleNode[]) => {
  const regularBubbles = getBubblesUpToYear(bubbles, currentYear, visitedBubbles)
  return [...regularBubbles, ...activeHiddenBubbles]
}

   // Найти следующий год с новыми пузырями
export const findNextYearWithNewBubbles = (bubbles: BubbleNode[], currentYear: number, visitedBubbleIds: number[] = []): BubbleNode['year'] => {
  const availableYears = [...new Set(
    bubbles
      .filter(bubble => !bubble.isHidden && !bubble.isQuestion)
      .map(bubble => bubble.year)
  )].sort((a, b) => a - b)
  
  for (const year of availableYears) {
    if (year > currentYear) {
      const newBubblesInYear = bubbles.filter(bubble => {
        const isInYear = bubble.year === year
        const isNotVisited = !visitedBubbleIds.includes(bubble.id)
        const isNotPopped = !bubble.isPopped
        const isNotHidden = !bubble.isHidden
        const isNotQuestion = !bubble.isQuestion
        return isInYear && isNotVisited && isNotPopped && isNotHidden && isNotQuestion
      })
      
      if (newBubblesInYear.length > 0) {
        return year
      }
    }
  }
  
  return currentYear
}