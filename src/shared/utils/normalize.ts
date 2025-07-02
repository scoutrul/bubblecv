import type { Bubble } from '../types'

export function normalizeBubble(raw: any): Bubble {
  return {
    ...raw,
    isActive: raw.isActive !== false,
    isPopped: false,
    isVisited: false,
    isEasterEgg: !!raw.isEasterEgg,
    isHidden: !!raw.isHidden,
    isTough: !!raw.isTough,
    toughClicks: raw.toughClicks || 0,
    currentClicks: 0,
    color: raw.color || '#3b82f6',
    projects: Array.isArray(raw.projects) ? raw.projects : (raw.projects ? JSON.parse(raw.projects) : []),
    link: raw.link || '',
    size: raw.size || 'medium',
    bubbleType: raw.bubbleType || 'regular',
    description: raw.description || ''
  }
} 