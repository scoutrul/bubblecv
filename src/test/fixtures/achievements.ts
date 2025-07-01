import type { Achievement } from '@shared/types'
import { GAME_CONFIG } from '@shared/config/game-config'

export interface TestAchievement {
  id: string
  name: string
  description: string
  icon: string
  condition: string
  points: number
  xpReward: number // Для совместимости с game store
  unlocked: boolean
  unlockedAt?: string | null
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: string
}

export const mockAchievements: Omit<Achievement, 'isUnlocked' | 'unlockedAt' | 'isShown'>[] = [
  {
    id: 'first-bubble',
    name: 'Первый пузырь',
    description: 'Вы лопнули свой первый пузырь!',
    icon: '🎈',
    xpReward: 10,
    points: 5
  },
  {
    id: 'philosophy-seeker',
    name: 'Искатель мудрости',
    description: 'Вы ответили на философский вопрос!',
    icon: '💡',
    xpReward: 20,
    points: 10
  },
  {
    id: 'bubble-explorer-10',
    name: 'Исследователь пузырей',
    description: 'Вы лопнули 10 пузырей!',
    icon: '🔎',
    xpReward: 30,
    points: 15
  },
  {
    id: 'bubble-explorer-30',
    name: 'Опытный исследователь',
    description: 'Вы лопнули 30 пузырей!',
    icon: '🔬',
    xpReward: 50,
    points: 25
  },
  {
    id: 'bubble-explorer-50',
    name: 'Мастер пузырей',
    description: 'Вы лопнули 50 пузырей!',
    icon: '👑',
    xpReward: 100,
    points: 50
  },
  {
    id: 'first-level-master',
    name: 'Первопроходец',
    description: 'Вы прошли первый уровень! Путешествие в тысячу миль начинается с первого шага.',
    icon: '🚀',
    xpReward: GAME_CONFIG.achievementXP.basic,
    points: 10
  }
] 