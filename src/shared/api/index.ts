import mockData from '../data/mockData.json'
import contentLevelsData from '../data/contentLevels.json'
import type { Bubble, Level } from '../types'
import { normalizeBubble } from '../utils/normalize'

export const api = {
  async getContentLevels(): Promise<{ data: { levels: Level[] } }> {
    return { data: contentLevelsData }
  },
  
  async getBubbles(): Promise<{ data: Bubble[] }> {
    const bubbles: Bubble[] = mockData.bubbles.map(normalizeBubble)
    return { data: bubbles }
  }
} 