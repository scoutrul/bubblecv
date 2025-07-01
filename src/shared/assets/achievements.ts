import type { Achievement } from '@shared/types'
import { GAME_CONFIG } from '@shared/config/game-config'

export const allAchievements: Omit<Achievement, 'isUnlocked' | 'unlockedAt' | 'isShown'>[] = [
  {
    id: 'tough-bubble-popper',
    name: 'Крепыш',
    description: 'Вы пробили свой первый крепкий пузырь! Настойчивость - ключ к успеху в разработке.',
    icon: '💪',
    xpReward: GAME_CONFIG.achievementXP.intermediate
  },
  {
    id: 'secret-bubble-discoverer',
    name: 'Искатель секретов',
    description: 'Вы нашли и активировали скрытый пузырь!',
    icon: '🕵️',
    xpReward: GAME_CONFIG.achievementXP.advanced
  },
  {
    id: 'year-jumper',
    name: 'Путешественник во времени',
    description: 'Вы перешли на следующий год, не лопнув все пузыри!',
    icon: '⏭️',
    xpReward: GAME_CONFIG.achievementXP.advanced
  },
  {
    id: 'completionist',
    name: 'Перфекционист',
    description: 'Вы лопнули все доступные пузыри в году!',
    icon: '🏆',
    xpReward: GAME_CONFIG.achievementXP.master
  },
  {
    id: 'philosophy-master',
    name: 'Философ',
    description: 'Правильно ответили на первый философский вопрос! Мудрость приходит к тем, кто готов размышлять.',
    icon: '🤔',
    xpReward: GAME_CONFIG.achievementXP.basic
  },
  {
    id: 'on-the-edge',
    name: 'На краю',
    description: 'У вас осталась всего одна жизнь! Иногда лучшие решения принимаются под давлением.',
    icon: '🔥',
    xpReward: GAME_CONFIG.achievementXP.basic
  },
  {
    id: 'first-level-master',
    name: 'Первопроходец',
    description: 'Вы прошли первый уровень! Путешествие в тысячу миль начинается с первого шага.',
    icon: '🚀',
    xpReward: GAME_CONFIG.achievementXP.basic
  },
  {
    id: 'bubble-explorer-10',
    name: 'Исследователь',
    description: 'Изучили 10 пузырей технологий! Любопытство - двигатель прогресса.',
    icon: '🔍',
    xpReward: GAME_CONFIG.achievementXP.basic
  },
  {
    id: 'bubble-explorer-30',
    name: 'Эксперт по технологиям',
    description: 'Изучили 30 пузырей! Широкий кругозор - основа мастерства.',
    icon: '🎯',
    xpReward: GAME_CONFIG.achievementXP.intermediate
  },
  {
    id: 'bubble-explorer-50',
    name: 'Мастер всех технологий',
    description: 'Изучили 50 пузырей! Вы настоящий гуру в мире разработки.',
    icon: '🏆',
    xpReward: GAME_CONFIG.achievementXP.advanced
  },
  {
    id: 'final-level-master',
    name: 'Финалист',
    description: 'Достигли максимального уровня! Вы прошли весь путь развития и стали настоящим экспертом.',
    icon: '🎖️',
    xpReward: GAME_CONFIG.achievementXP.master
  }
] 