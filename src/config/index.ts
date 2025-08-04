import { SKILL_LEVELS } from '@/types/skill-levels'

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
        orbitRadiusRange: [10, 30] as [number, number], // Небольшая орбита для движения
        speedRange: [0.0001, 0.0003] as [number, number],
        animationDuration: [8, 15] as [number, number],
        isCenter: true
      },
      center: {
        radiusRange: [0.3, 1.3] as [number, number],
        opacityRange: [0.1, 0.4] as [number, number],
        orbitRadiusRange: [15, 40] as [number, number], // Небольшая орбита для движения
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

  // Базовые настройки движения пузырей для 1 уровня
  bubblePhysicsBase: {
    gravityStrength: 0.0005, // Сила притяжения к центру (уменьшена)
    vortexStrength: 0.0002,  // Сила кругового движения (воронка)
    oscillationStrength: 0.3, // Сила колебательного движения
    randomStrength: 0.05,    // Сила случайного движения
    dampingFactor: 0.92,     // Коэффициент затухания скорости
    velocityMultiplier: 0.1  // Множитель скорости от отталкивания
  } as const,

  // Базовые настройки физики взрыва для 1 уровня
  explosionPhysicsBase: {
    pushForceMultiplier: 1.5,    // Множитель силы отталкивания соседей (уменьшен)
    pushMaxVelocity: 8,          // Максимальная скорость отталкивания (уменьшена)
    explosionForceMultiplier: 2, // Множитель силы взрыва (уменьшен)
    explosionMaxVelocity: 10,    // Максимальная скорость взрыва (уменьшена)
    explosionRadiusMultiplier: 0.25, // Множитель радиуса взрыва при клике в пустое место (уменьшен)
    explosionStrengthBase: 8,    // Базовая сила взрыва при клике в пустое место (уменьшена)
    bubbleExplosionRadiusMultiplier: 5, // Множитель радиуса взрыва баббла (возвращен к изначальному)
    bubbleExplosionStrengthBase: 18,    // Базовая сила взрыва баббла (возвращена к изначальному)
    hoverPushRadiusMultiplier: 1.5,      // Множитель радиуса отталкивания при наведении (уменьшен)
    hoverPushStrengthBase: 1.5,          // Базовая сила отталкивания при наведении (уменьшена)
    bubbleJumpBaseStrength: 3,           // Базовая сила отскока бабблов (увеличена)
    bubbleJumpClickMultiplier: 0.15,     // Множитель увеличения отскока с каждым кликом (увеличен)
  } as const,

  // Базовые настройки симуляции D3 для 1 уровня
  simulationPhysicsBase: {
    centerForceStrength: 0.005,
    collisionForceStrength: 0.7,
    chargeForceStrength: -8,
    attractForceStrength: 0.003,
    alphaBase: 0.3,
    velocityDecay: 0.85,
    restartInterval: 3000,
  } as const,

} as const

export const maxGameLevel = Object.keys(GAME_CONFIG.levelRequirements).length

// Реэкспортируем утилиты для удобства
export { XP_CALCULATOR, PHYSICS_CALCULATOR } from '@/utils'
