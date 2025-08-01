import type { Level } from '@/types/levels'
import type { Bubble, Achievement, Bonus } from '@/types/data'
import type { NormalizedBubble, NormalizedAchievement, NormalizedLevel, NormalizedBonus, BubbleSizes } from '@/types/normalized'
import type { Question } from '@/types/data'
import { XP_CALCULATOR } from '@/config'

// Значения по умолчанию для пузыря
const DEFAULT_BUBBLE_PROPS = {
  isActive: false,
  isPopped: false,
  isTough: false,
  isHidden: false,
  isQuestion: false,
  toughClicks: 0,
  size: 'medium' as const,
}

// Функция для определения размера по уровню экспертизы
function getSizeBySkillLevel(skillLevel: string): BubbleSizes {
  switch (skillLevel) {
    case 'novice':
    case 'intermediate':
      return 'small'
    case 'confident':
      return 'medium'
    case 'expert':
    case 'master':
      return 'large'
    default:
      return 'medium'
  }
}

export function normalizeSkillBubble(bubble: Bubble, id: number): NormalizedBubble {
  // Каждый 9-й пузырь делаем tough (но не вопросы)
  const isTough = id % 9 === 0
  
  return {
    ...bubble,
    ...DEFAULT_BUBBLE_PROPS,
    id,
    isTough,
    size: getSizeBySkillLevel(bubble.skillLevel),
  }
}

export function createPhilosophyBubble(question: Question, year: number): NormalizedBubble {
  // Создаем числовой хеш из строкового ID
  const questionHash = question.id.split('').reduce((hash, char) => {
    return ((hash << 5) - hash + char.charCodeAt(0)) & 0xfffffff
  }, 0)
  
  // Случайный размер для философских пузырей
  const seed = Math.abs(year * 100000 + questionHash) % 3
  const sizeOptions: BubbleSizes[] = ['small', 'medium', 'large']
  const randomSize = sizeOptions[seed]
  
  return {
    id: -(year * 100000 + questionHash), // Отрицательный ID для философских пузырей, уникальный для каждого года и вопроса
    name: 'Философский вопрос',
    year,
    skillLevel: 'expert',
    description: question.question,
    insight: question.insight,
    questionId: question.id,
    questionData: question, // Сохраняем полные данные вопроса
    ...DEFAULT_BUBBLE_PROPS,
    isQuestion: true,
    size: randomSize,
  }
}

export function normalizeAchievement(raw: Achievement): NormalizedAchievement {
  return {
    ...raw,
    xpReward: XP_CALCULATOR.getAchievementXP(raw.id),
    isUnlocked: false,
    isShown: false,
  }
}

export function normalizeLevels(raw: Level): NormalizedLevel {
  return {
    ...raw,
    xpRequired: 0
  }
}

export function normalizeBonus(bonus: Bonus, index: number): NormalizedBonus {
  return {
    ...bonus,
    id: index,
    isUnlocked: false
  }
}

export function normalizeOldBubble(bubble: Bubble, id: number): NormalizedBubble {
  return {
    ...bubble,
    ...DEFAULT_BUBBLE_PROPS,
    id,
    size: getSizeBySkillLevel(bubble.skillLevel),
    category: bubble.category || 'life'
  }
}

export function createHiddenBubble(year: number): NormalizedBubble {
  return {
    id: -(year * 10000 + 9999), // Уникальный отрицательный ID для скрытых пузырей
    name: 'Скрытый пузырь',
    year,
    skillLevel: 'intermediate',
    description: 'Этот пузырь почти невидим. Найдите его!',
    ...DEFAULT_BUBBLE_PROPS,
    isHidden: true,
    size: 'small', // Всегда маленький размер
  }
}

