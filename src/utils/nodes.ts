import type { BubbleNode } from '@/types/canvas'
import type { NormalizedBubble } from '@/types/normalized'
import { GAME_CONFIG } from '@/config'

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
  activeHiddenBubbles: BubbleNode[] = [],
  hasUnlockedFirstToughBubbleAchievement: boolean = false,
  maxBubbles: number = GAME_CONFIG.MAX_BUBBLES_ON_SCREEN(),
  isProjectMode: boolean = false
): BubbleNode[] => {
  // В режиме проекта показываем ВСЕ пузыри (кроме скрытых/вопросов), в режиме карьеры фильтруем по году
  const filtered = isProjectMode 
    ? bubbles.filter(b => !b.isHidden && !b.isQuestion && !b.isPopped && !visited.includes(b.id))
    : getBubblesUpToYear(bubbles, currentYear, visited)
  
  // Добавляем скрытые пузыри, если они есть и не были посещены
  const hiddenBubbles = bubbles
    .filter(b => b.isHidden && !b.isPopped && (!isProjectMode ? b.year <= currentYear : true) && !visited.includes(b.id))
    .map(normalizedToBubbleNode)
  
  // Объединяем все пузыри и сортируем
  const allBubbles = [
    ...filtered.map(normalizedToBubbleNode),
    ...hiddenBubbles,
    ...(activeHiddenBubbles || [])
  ].sort((a, b) => {
    if (isProjectMode) {
      // В режиме проекта сортируем по ID (порядок в данных)
      return a.id - b.id
    } else {
      // В режиме карьеры сортируем по приоритету годов
      // Приоритет 1: пузыри текущего года
      if (a.year === currentYear && b.year !== currentYear) return -1
      if (b.year === currentYear && a.year !== currentYear) return 1
      
      // Приоритет 2: пузыри текущего года сортируются по ID (порядок в данных)
      if (a.year === currentYear && b.year === currentYear) {
        return a.id - b.id
      }
      
      // Приоритет 3: предыдущие годы сортируются по убыванию (новые → старые)
      return b.year - a.year
    }
  })
  
  // Ограничиваем до максимального количества
  return allBubbles.slice(0, maxBubbles)
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
