import { SKILL_LEVELS, BUBBLE_SIZES } from '../constants/skill-levels'

export const GAME_CONFIG = {
  // Требования XP для каждого уровня
  levelRequirements: {
    1: 0,     // Начальный уровень
    2: 50,    // Нужно 50 XP для достижения уровня 2
    3: 100,   // Нужно 100 XP для достижения уровня 3
    4: 150,   // Нужно 150 XP для достижения уровня 4
    5: 200    // Нужно 200 XP для достижения уровня 5
  } as const,
  
  // Награды за достижения
  achievementXP: {
    basic: 5,        // Базовое достижение
    intermediate: 8,  // Промежуточное достижение
    advanced: 12,    // Продвинутое достижение
    master: 15       // Мастерское достижение
  } as const,
  
  // Lives System
  maxLives: 5,
  initialLives: 3,  // Стартовые жизни при первом запуске
  livesPenalty: 1,
  
  // Bubble Experience - опыт за уровни экспертизы
  xpPerBubble: 5,      // Уменьшено с 10
  xpPerEasterEgg: 5,   // Философский пузырь - базовый XP за разбиение (независимо от ответа)
  xpPerSecretBubble: 10, // Скрытый пузырь - только за сам пузырь, без достижения
  
  // XP за уровни экспертизы пузырей
  xpPerExpertiseLevel: {
    [SKILL_LEVELS.NOVICE]: 1,
    [SKILL_LEVELS.INTERMEDIATE]: 2, 
    [SKILL_LEVELS.CONFIDENT]: 3,
    [SKILL_LEVELS.EXPERT]: 4,
    [SKILL_LEVELS.MASTER]: 5
  } as const,
  
  // Philosophy Questions XP/Lives
  philosophyCorrectXp: 8,      // Уменьшено с 15
  philosophyWrongLives: 1,     // -1 жизнь за неправильный ответ
  
  // Game Over & Restart
  restartYear: 2015,             // С какого года начинается игра заново
  gameOverBlockBubbles: true,
  
  // Expertise Levels - Уровни экспертизы (с уменьшенными размерами)
  expertiseLevels: {
    [SKILL_LEVELS.NOVICE]: {
      name: 'Новичок',
      color: '#334155',
      sizeMultiplier: 0.75,
      opacity: 0.85,
      hasGradient: true,
      gradientColors: ['#334155', '#475569'], // Slate
    },
    [SKILL_LEVELS.INTERMEDIATE]: {
      name: 'С опытом',
      color: '#064E3B',
      sizeMultiplier: 0.8,
      opacity: 0.9,
      hasGradient: true,
      gradientColors: ['#064E3B', '#047857'], // Deep green
    },
    [SKILL_LEVELS.CONFIDENT]: {
      name: 'Уверенный',
      color: '#92400E',
      sizeMultiplier: 0.85,
      opacity: 0.93,
      hasGradient: true,
      gradientColors: ['#92400E', '#FBBF24'], // Amber
    },
    [SKILL_LEVELS.EXPERT]: {
      name: 'Эксперт',
      color: '#581C87',
      sizeMultiplier: 0.9,
      opacity: 0.95,
      hasGradient: true,
      gradientColors: ['#581C87', '#9333EA'], // Violet
    },
    [SKILL_LEVELS.MASTER]: {
      name: 'Мастер',
      color: '#EAB308',
      sizeMultiplier: 0.95,
      opacity: 1,
      hasGradient: true,
      gradientColors: ['#FEF08A', '#EAB308', '#CA8A04'], // Bright Gold
    },
  } as const,

  // Philosophy Bubbles - Визуализация философских пузырей (исправленный размер)
  philosophyBubble: {
    hasGradient: true,
    gradientColors: ['#FF0080', '#FF4080', '#FF8080', '#B3FF80', '#FFFFFF00'],
    sizeMultiplier: 0.9,           // Чуть меньше обычных пузырей (было -0.9)
    opacity: 0.95,
    name: 'Философский вопрос'
  } as const,
  
  // Animation Durations (ms)
  animation: {
    bubbleHover: 300,
    levelUp: 1500,
    xpGain: 1500,
    modalTransition: 250,
    expertiseGlow: 2000,        // Анимация свечения для высоких уровней
    masterPulse: 3000,          // Пульсация для мастер-уровня
    lifeLoss: 1500             // ms
  } as const,
  
  // Timeline
  startYear: 2010,
  endYear: 2025,
  
  // Canvas Dimensions
  canvas: {
    minWidth: 800,
    minHeight: 600,
    padding: 50
  } as const,
  
  // D3 Force Simulation
  simulation: {
    forceStrength: -300,
    collisionRadiusMultiplier: 1.5,
    centerStrength: 0.1,
    velocityDecay: 0.4
  } as const,

  // Hidden Bubble - визуализация особого скрытого пузыря
  hiddenBubble: {
    hasGradient: true,
    gradientColors: ['#00000000', '#64748B33', '#64748B11', '#FFFFFF00'], // почти прозрачный серо-голубой градиент
    sizeMultiplier: 1.3, // чуть меньше обычных
    opacity: 0, // очень высокая прозрачность
    name: 'Скрытый пузырь'
  } as const,

  // Tough Bubble - визуализация крепкого пузыря
  toughBubble: {
    hasGradient: true,
    gradientColors: ['#FFFFFF', '#FBBF24', '#F59E0B'], // яркий золотой градиент
    sizeMultiplier: 1.1, // чуть больше обычных
    opacity: 1,
    glowColor: '#F59E0B33', // цвет свечения
    glowSize: 10, // размер свечения
    name: 'Крепкий пузырь'
  } as const,
} as const

// Централизованные функции для расчета XP
export const XP_CALCULATOR = {
  // Расчет XP за обычный пузырь
  getBubbleXP: (skillLevel: string): number => {
    return GAME_CONFIG.xpPerExpertiseLevel[skillLevel as keyof typeof GAME_CONFIG.xpPerExpertiseLevel] || 1
  },
  
  // Расчет XP за философский пузырь
  getPhilosophyBubbleXP: (): number => {
    return GAME_CONFIG.xpPerEasterEgg
  },
  
  // Расчет XP за скрытый пузырь  
  getSecretBubbleXP: (): number => {
    return GAME_CONFIG.xpPerSecretBubble
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
  
  // Общий расчет XP за пузырь (включая тип пузыря)
  getTotalBubbleXP: (bubble: { isEasterEgg?: boolean; isHidden?: boolean; skillLevel?: string }): number => {
    if (bubble.isHidden) {
      return XP_CALCULATOR.getSecretBubbleXP()
    } else if (bubble.isEasterEgg) {
      return XP_CALCULATOR.getPhilosophyBubbleXP()
    } else {
      return XP_CALCULATOR.getBubbleXP(bubble.skillLevel || 'novice')
    }
  }
} as const

export type GameLevel = keyof typeof GAME_CONFIG.levelRequirements
export type AnimationType = keyof typeof GAME_CONFIG.animation
export type ExpertiseLevel = keyof typeof GAME_CONFIG.expertiseLevels
export type ExpertiseXPLevel = keyof typeof GAME_CONFIG.xpPerExpertiseLevel 