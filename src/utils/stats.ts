import { api } from '@/api'
import type { NormalizedBubble } from '@/types/normalized'

export type BubbleKind = 'normal'|'tough'|'hidden'|'philosophy'

export const buildBubbleTypeIndex = async (): Promise<Map<number, BubbleKind>> => {
  const [skills, projects, olds] = await Promise.all([
    api.getBubbles(),
    api.getProjectBubbles(),
    api.getOldBubbles()
  ])
  const index = new Map<number, BubbleKind>()
  const register = (b: NormalizedBubble) => {
    if (b.isQuestion) { index.set(b.id, 'philosophy'); return }
    if (b.isHidden) { index.set(b.id, 'hidden'); return }
    if (b.isTough) { index.set(b.id, 'tough'); return }
    index.set(b.id, 'normal')
  }
  skills.data.forEach(register)
  projects.data.forEach(register)
  olds.data.forEach(register)
  return index
}

export const computeVisitedStats = (visitedIds: number[], index: Map<number, BubbleKind>) => {
  const totals = { normal: 0, tough: 0, hidden: 0, philosophy: 0 }
  for (const id of visitedIds) {
    const kind = index.get(id)
    if (kind && kind in totals) {
      // @ts-ignore
      totals[kind]++
    }
  }
  return totals
}
