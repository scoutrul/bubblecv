import type { Achievement } from '@shared/types'
import { XP_CALCULATOR } from '@shared/config/game-config'

export const allAchievements: Omit<Achievement, 'isUnlocked' | 'unlockedAt' | 'isShown'>[] = [
  {
    id: 'tough-bubble-popper',
    name: 'Крепыш',
    description: 'Вы пробили свой первый крепкий пузырь! Настойчивость - ключ к успеху в разработке.',
    icon: '💪',
    xpReward: XP_CALCULATOR.getAchievementXP('tough-bubble-popper')
  },
  {
    id: 'secret-bubble-discoverer',
    name: 'Искатель секретов',
    description: 'Вы нашли и активировали скрытый пузырь!',
    icon: '🕵️',
    xpReward: XP_CALCULATOR.getAchievementXP('secret-bubble-discoverer')
  },
  {
    id: 'year-jumper',
    name: 'Путешественник во времени',
    description: 'Вы перешли на следующий год, не лопнув все пузыри!',
    icon: '⏭️',
    xpReward: XP_CALCULATOR.getAchievementXP('year-jumper')
  },
  {
    id: 'completionist',
    name: 'Перфекционист',
    description: 'Вы лопнули все доступные пузыри в году!',
    icon: '🏆',
    xpReward: XP_CALCULATOR.getAchievementXP('completionist')
  },
  {
    id: 'philosophy-master',
    name: 'Философ',
    description: 'Правильно ответили на первый философский вопрос! Мудрость приходит к тем, кто готов размышлять.',
    icon: '🤔',
    xpReward: XP_CALCULATOR.getAchievementXP('philosophy-master')
  },
  {
    id: 'on-the-edge',
    name: 'На краю',
    description: 'У вас осталась всего одна жизнь! Иногда лучшие решения принимаются под давлением.',
    icon: '🔥',
    xpReward: XP_CALCULATOR.getAchievementXP('on-the-edge')
  },
  {
    id: 'first-level-master',
    name: 'Первопроходец',
    description: 'Вы прошли первый уровень! Путешествие в тысячу миль начинается с первого шага.',
    icon: '🚀',
    xpReward: XP_CALCULATOR.getAchievementXP('first-level-master')
  },
  {
    id: 'bubble-explorer-10',
    name: 'Исследователь',
    description: 'Изучили 10 пузырей технологий! Любопытство - двигатель прогресса.',
    icon: '🔍',
    xpReward: XP_CALCULATOR.getAchievementXP('bubble-explorer-10')
  },
  {
    id: 'bubble-explorer-30',
    name: 'Эксперт по технологиям',
    description: 'Изучили 30 пузырей! Широкий кругозор - основа мастерства.',
    icon: '🎯',
    xpReward: XP_CALCULATOR.getAchievementXP('bubble-explorer-30')
  },
  {
    id: 'bubble-explorer-50',
    name: 'Мастер всех технологий',
    description: 'Изучили 50 пузырей! Вы настоящий гуру в мире разработки.',
    icon: '🏆',
    xpReward: XP_CALCULATOR.getAchievementXP('bubble-explorer-50')
  },
  {
    id: 'final-level-master',
    name: 'Финалист',
    description: 'Достигли максимального уровня! Вы прошли весь путь развития и стали настоящим экспертом.',
    icon: '🎖️',
    xpReward: XP_CALCULATOR.getAchievementXP('final-level-master')
  }
] 