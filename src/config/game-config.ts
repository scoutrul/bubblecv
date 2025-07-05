import { SKILL_LEVELS, type SkillLevel } from '../types/skill-levels'

export const GAME_CONFIG = {
  initialYear: 2015,
  initialLives: 3,
  maxLives: 5,

  TOUGH_BUBBLE_CLICKS_REQUIRED: 10,

  levelRequirements: {
    1: 0,     // Начальный уровень
    2: 50,    // Нужно 50 XP для достижения уровня 2
    3: 100,   // Нужно 100 XP для достижения уровня 3
    4: 150,   // Нужно 150 XP для достижения уровня 4
    5: 200    // Нужно 200 XP для достижения уровня 5
  } as const,
  
  achievementXP: {
    basic: 5,        
    intermediate: 8,  
    advanced: 12,    
    master: 15       
  } as const,
  
  xpPerExpertiseLevel: {
    [SKILL_LEVELS.NOVICE]: 1,
    [SKILL_LEVELS.INTERMEDIATE]: 2, 
    [SKILL_LEVELS.CONFIDENT]: 3,
    [SKILL_LEVELS.EXPERT]: 4,
    [SKILL_LEVELS.MASTER]: 5
  } as const,
  

  expertiseBubbles: {
    [SKILL_LEVELS.NOVICE]: {
      name: 'Новичок',
      color: '#334155',
      sizeMultiplier: 0.75,
      opacity: 0.85,
      gradientColors: ['#334155', '#475569'], // Slate
    },
    [SKILL_LEVELS.INTERMEDIATE]: {
      name: 'С опытом',
      color: '#064E3B',
      sizeMultiplier: 0.8,
      opacity: 0.9,
      gradientColors: ['#064E3B', '#047857'], // Deep green
    },
    [SKILL_LEVELS.CONFIDENT]: {
      name: 'Уверенный',
      color: '#92400E',
      sizeMultiplier: 0.85,
      opacity: 0.93,
      gradientColors: ['#92400E', '#FBBF24'], // Amber
    },
    [SKILL_LEVELS.EXPERT]: {
      name: 'Эксперт',
      color: '#581C87',
      sizeMultiplier: 0.9,
      opacity: 0.95,
      gradientColors: ['#581C87', '#9333EA'], // Violet
    },
    [SKILL_LEVELS.MASTER]: {
      name: 'Мастер',
      color: '#EAB308',
      sizeMultiplier: 0.95,
      opacity: 1,
      gradientColors: ['#FEF08A', '#EAB308', '#CA8A04'], // Bright Gold
    },
  } as const,

  questionBubble: {
    gradientColors: ['#FF0080', '#FF4080', '#FF8080', '#B3FF80', '#FFFFFF00'],
    sizeMultiplier: 0.9,    
    opacity: 0.95,
    name: 'Философский вопрос'
  } as const,

  hiddenBubble: {
    gradientColors: ['#00000000', '#64748B33', '#64748B11', '#FFFFFF00'], 
    sizeMultiplier: 1.3,
    opacity: 0, 
    name: 'Скрытый пузырь'
  } as const,

} as const

// Централизованные функции для расчета XP
export const XP_CALCULATOR = {  
  getBubbleXP: (skillLevel: SkillLevel): number => {
    return skillLevel ? GAME_CONFIG.xpPerExpertiseLevel[skillLevel] : GAME_CONFIG.xpPerExpertiseLevel[SKILL_LEVELS.NOVICE]
  },
  getPhilosophyBubbleXP: (): number => {
    return GAME_CONFIG.achievementXP.intermediate
  },
  getSecretBubbleXP: (): number => {
    return GAME_CONFIG.achievementXP.basic
  },
  // Расчет XP за достижение
  getAchievementXP: (achievementId: string): number => {
    switch (achievementId) {
      case 'philosophy-master':
      case 'on-the-edge':
      case 'first-level-master':
      case 'bubble-explorer-10':
        return GAME_CONFIG.achievementXP.basic
      case 'tough-bubble-popper':
      case 'bubble-explorer-30':
        return GAME_CONFIG.achievementXP.intermediate
      case 'secret-bubble-discoverer':
      case 'year-jumper':
      case 'bubble-explorer-50':
        return GAME_CONFIG.achievementXP.advanced
      case 'completionist':
      case 'final-level-master':
        return GAME_CONFIG.achievementXP.master
      default:
        return GAME_CONFIG.achievementXP.basic
    }
  },

} as const

export type GameLevelNumber = keyof typeof GAME_CONFIG.levelRequirements