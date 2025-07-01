/**
 * Тестовые фикстуры для пузырей
 */

import type { Bubble, SkillLevel, BubbleSize } from '@shared/types'
import { SKILL_LEVELS, BUBBLE_SIZES } from '@shared/constants/skill-levels'

export interface TestBubble extends Bubble {
  // Дополнительные поля для тестирования могут быть добавлены здесь
  insight?: string
  points?: number
}

export const mockBubbles: TestBubble[] = Array.from({ length: 20 }, (_, i) => ({
  id: `bubble-${i + 1}`,
  name: `Bubble ${i + 1}`,
  skillLevel: SKILL_LEVELS.NOVICE,
  year: 2020 + (i % 3), // 2020, 2021, 2022
  isActive: true,
  isEasterEgg: false,
  isHidden: false,
  description: `Description for bubble ${i + 1}`,
  projects: [],
  isPopped: false,
  isVisited: false,
  size: BUBBLE_SIZES.NOVICE,
  color: '#3b82f6',
  isTough: false,
  toughClicks: 0,
  currentClicks: 0,
  link: ''
}))

export const mockHiddenBubble: TestBubble = {
  id: "hidden-secret",
  name: "Secret Technology",
  year: 2023,
  size: BUBBLE_SIZES.MASTER as BubbleSize,
  skillLevel: SKILL_LEVELS.MASTER as SkillLevel,
  description: "Секретная технология",
  insight: "Это скрытый пузырь",
  link: undefined,
  points: 100,
  isEasterEgg: true,
  category: "Hidden",
  projects: [],
  isActive: true,
  isPopped: false,
  isVisited: false,
  isHidden: true,
  color: "#ff00ff",
  bubbleType: "hidden",
  isTough: false,
  toughClicks: 0,
  currentClicks: 0
}

export const mockPhilosophyBubble: TestBubble = {
  id: "philosophy-thinking",
  name: "Critical Thinking",
  year: 2023,
  size: BUBBLE_SIZES.EXPERT as BubbleSize,
  skillLevel: SKILL_LEVELS.EXPERT as SkillLevel,
  description: "Философский пузырь для размышлений",
  insight: "Развивает критическое мышление",
  link: undefined,
  points: 80,
  isEasterEgg: false,
  category: "Philosophy",
  projects: [],
  isActive: true,
  isPopped: false,
  isVisited: false,
  color: "#9333ea",
  bubbleType: "philosophy",
  isTough: false,
  toughClicks: 0,
  currentClicks: 0
}

const baseTestBubble: Omit<TestBubble, 'id' | 'name' | 'year' | 'category'> = {
  size: BUBBLE_SIZES.INTERMEDIATE,
  skillLevel: SKILL_LEVELS.INTERMEDIATE,
  description: "Test description",
  insight: "Test insight",
  link: undefined,
  points: 1,
  isEasterEgg: false,
  projects: [],
  isActive: true,
  isPopped: false,
  isVisited: false,
  color: "#cccccc",
  bubbleType: "regular",
  isTough: false,
  toughClicks: 0,
  currentClicks: 0
};

/**
 * Создает массив пузырей для тестирования определенного года
 */
export function createBubblesByYear(year: number, count = 3): TestBubble[] {
  return Array.from({ length: count }, (_, index) => ({
    ...baseTestBubble,
    id: `bubble-${year}-${index}`,
    name: `Test Bubble ${year}-${index}`,
    year,
    size: BUBBLE_SIZES.NOVICE,
    skillLevel: SKILL_LEVELS.NOVICE,
    category: "test",
    points: index + 1,
  }))
}

/**
 * Создает массив пузырей с разными категориями
 */
export function createBubblesByCategory(): TestBubble[] {
  const categories = ["frontend", "backend", "tools", "design"]
  
  return categories.map((category, index) => ({
    ...baseTestBubble,
    id: `${category}-bubble`,
    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Bubble`,
    year: 2020 + index,
    category,
  }))
}

/**
 * Создает пузырь с кастомными параметрами
 */
export function createCustomBubble(overrides: Partial<TestBubble>): TestBubble {
  return {
    ...baseTestBubble,
    id: "custom-bubble",
    name: "Custom Bubble",
    year: 2023,
    category: "test",
    ...overrides
  }
}

/**
 * Массив пузырей для тестирования пагинации
 */
export function createLargeBubbleSet(count = 50): TestBubble[] {
  return Array.from({ length: count }, (_, index) => ({
    ...baseTestBubble,
    id: `bubble-${index}`,
    name: `Bubble ${index}`,
    year: 2010 + (index % 15),
    size: [BUBBLE_SIZES.NOVICE, BUBBLE_SIZES.INTERMEDIATE, BUBBLE_SIZES.CONFIDENT, BUBBLE_SIZES.EXPERT][index % 4],
    skillLevel: [SKILL_LEVELS.NOVICE, SKILL_LEVELS.INTERMEDIATE, SKILL_LEVELS.EXPERT, SKILL_LEVELS.MASTER][index % 4],
    link: index % 5 === 0 ? `https://example.com/bubble-${index}` : undefined,
    points: (index % 5) + 1,
    isEasterEgg: index % 10 === 0,
    category: ["frontend", "backend", "tools", "design"][index % 4],
  }))
} 