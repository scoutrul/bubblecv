import { SKILL_LEVELS, type SkillLevel } from '../types/skill-levels'

export const GAME_CONFIG = {
  initialYear: 2015,
  initialLives: 3,
  maxLives: 5,

  TOUGH_BUBBLE_CLICKS_REQUIRED: () => Math.floor(Math.random() * 8) + 5, // 5-12 кликов

  levelRequirements: {
    1: 0,    
    2: 50,   
    3: 100,  
    4: 150,  
    5: 200   
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
      opacity: 0.85,
      gradientColors: ['#6B7280', '#FFD5DB'], 
    },
    [SKILL_LEVELS.INTERMEDIATE]: {
      name: 'С опытом',
      opacity: 0.9,
      gradientColors: ['#1F2937', '#DD5563'], 
    },
    [SKILL_LEVELS.CONFIDENT]: {
      name: 'Уверенный',
      opacity: 0.93,
      gradientColors: ['#D2400E', '#F97706', '#FBBF24'],
    },
    [SKILL_LEVELS.EXPERT]: {
      name: 'Эксперт',
      opacity: 0.95,
      gradientColors: ['#E5E7EB', '#D1D5DB', '#9CA3AF', '#9CA3AF00'], 
    },
    [SKILL_LEVELS.MASTER]: {
      name: 'Мастер',
      opacity: 1,
      gradientColors: ['#FDE68A', '#F59E0B', '#CA8A04', '#CA8A0400'],
    },
  } as const,

  questionBubble: {
    gradientColors: ['#FF0080', '#FF4080', '#FF8080', '#B3FF80', '#FFFFFF00'],
    opacity: 0.95,
    name: 'Философский вопрос'
  } as const,

  hiddenBubble: {
    opacity: 0, 
    gradientColors: [],
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
  getPhilosophyXP: (agreementLevel: number): number => {
    const baseXP = GAME_CONFIG.achievementXP.basic
    return baseXP + (baseXP * agreementLevel)
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

export const maxGameLevel = Object.keys(GAME_CONFIG.levelRequirements).length