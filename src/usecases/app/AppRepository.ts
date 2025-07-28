import type { AppRepository as IAppRepository } from './types'
import type { NormalizedBubble } from '@/types/normalized'
import { api } from '@/api'
import { getYearRange } from '@/utils/ui'
import { useLevelStore } from '@/stores/levels.store'

export class AppRepositoryImpl implements IAppRepository {
  async getOldBubbles(): Promise<NormalizedBubble[]> {
    try {
      const { data: oldBubbles } = await api.getOldBubbles()
      return oldBubbles
    } catch (error) {
      console.error('❌ Ошибка загрузки старых пузырей:', error)
      return []
    }
  }

  getYearRange(bubbles: NormalizedBubble[]): { startYear: number; endYear: number } {
    return getYearRange(bubbles)
  }

  getFirstLevelData(): { title: string; icon: string } {
    const levelStore = useLevelStore()
    const firstLevel = levelStore.getLevelByNumber(1)
    
    return {
      title: firstLevel?.title || 'Посетитель',
      icon: firstLevel?.icon || '👋'
    }
  }
} 