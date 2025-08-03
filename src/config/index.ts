import { SKILL_LEVELS, type SkillLevel } from '@/types/skill-levels'

export const GAME_CONFIG = {
  initialYear: 2015,
  initialLives: 3,
  maxLives: 5,

  TOUGH_BUBBLE_CLICKS_REQUIRED: () => Math.floor(Math.random() * 8) + 5, // 5-12 кликов
  HIDDEN_BUBBLE_CLICKS_REQUIRED: () => Math.floor(Math.random() * 6) + 3, // 3-8 кликов
  HIDDEN_BUBBLE_XP_PER_CLICK: 2, // XP за каждый клик по скрытому пузырю

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
    [SKILL_LEVELS.NOVICE]: 3,
    [SKILL_LEVELS.INTERMEDIATE]: 5,
    [SKILL_LEVELS.CONFIDENT]: 7,
    [SKILL_LEVELS.EXPERT]: 9,
    [SKILL_LEVELS.MASTER]: 12
  } as const,

  // UI анимации
  animations: {
    xpGain: 200,
    shake: 700
  } as const,

  // Настройки производительности
  performance: {
    // Пороги FPS для оптимизации
    fpsThreshold: 24, // Порог FPS для начала оптимизации
    fpsTarget: 58, // Целевой FPS для повышения производительности
    
    // Частота проверки производительности
    optimizationCheckFrequency: 60, // Проверяем каждые 60 кадров
    
    // Количество звезд по уровням производительности
    starCounts: {
      // Уровень 0 - полная производительность
      full: {
        deepBg: 4000, // Самый дальний фоновый слой
        center: 400,  // Центральный слой
        bg: 70,       // Задний слой
        fg: 30        // Передний слой
      },
      // Уровень 1 - оптимизированная производительность
      optimized: {
        deepBg: 1000,    // Убираем дальний фон
        center: 400,  // Сокращаем центральный слой в 2 раза
        bg: 70,       // Задний слой без изменений
        fg: 30        // Передний слой без изменений
      },
      // Уровень 2 - минимальная производительность
      minimal: {
        deepBg: 0,    // Убираем дальний фон
        center: 0,    // Убираем центральный фон
        bg: 70,       // Задний слой без изменений
        fg: 30        // Передний слой без изменений
      }
    } as const,

    // Параметры звезд для каждого слоя
    starLayers: {
      deepBg: {
        radiusRange: [0.3, 0.8] as [number, number],
        opacityRange: [0.1, 0.25] as [number, number],
        orbitRadiusRange: [0.3, 0.7] as [number, number], // Относительно размера экрана
        speedRange: [0.0001, 0.0003] as [number, number],
        animationDuration: [8, 15] as [number, number],
        isCenter: true
      },
      center: {
        radiusRange: [0.3, 1.3] as [number, number],
        opacityRange: [0.1, 0.4] as [number, number],
        orbitRadiusRange: [50, 0.4] as [number, number], // 50px + 40% от размера экрана
        speedRange: [0, 0.0005] as [number, number],
        animationDuration: [3, 7] as [number, number],
        isCenter: true
      },
      bg: {
        radiusRange: [0.5, 1.7] as [number, number],
        opacityRange: [0.1, 0.5] as [number, number],
        orbitRadiusRange: [20, 120] as [number, number],
        speedRange: [0.001, 0.003] as [number, number],
        animationDuration: [2, 5] as [number, number],
        isCenter: false
      },
      fg: {
        radiusRange: [0.8, 2.4] as [number, number],
        opacityRange: [0.4, 1.0] as [number, number],
        orbitRadiusRange: [30, 180] as [number, number],
        speedRange: [0.001, 0.004] as [number, number],
        animationDuration: [0.8, 2.3] as [number, number],
        isCenter: false
      }
    } as const
  } as const,

  expertiseBubbles: {
    [SKILL_LEVELS.NOVICE]: {
      name: 'Новичок',
      opacity: 0.85,
      gradientColors: ['#6B72F0', '#6B72F00F'],
    },
    [SKILL_LEVELS.INTERMEDIATE]: {
      name: 'С опытом',
      opacity: 0.9,
      gradientColors: ['#DF2937', '#FF2937', '#DD55630F'],
    },
    [SKILL_LEVELS.CONFIDENT]: {
      name: 'Уверенный',
      opacity: 0.93,
      gradientColors: ['#FBBF24', '#F97706', '#D2400E'],
    },
    [SKILL_LEVELS.EXPERT]: {
      name: 'Эксперт',
      opacity: 0.95,
      gradientColors: ['#E5E7EB', '#D1D5DB', '#9CA3AF0F', '#9CA3AF00'],
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
  getPhilosophyBubbleXP: ({isCustom}: {isCustom?: boolean} = {isCustom: false}): number => {
    return isCustom ? GAME_CONFIG.achievementXP.master : GAME_CONFIG.achievementXP.intermediate
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

export const maxGameLevel = Object.keys(GAME_CONFIG.levelRequirements).length
