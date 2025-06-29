export const GAME_CONFIG = {
  // XP System - обновлено на основе анализа данных
  XP_LEVELS: {
    LEVEL_1: 22,   // Уровень 1: 0-22 XP
    LEVEL_2: 44,   // Уровень 2: 22-44 XP  
    LEVEL_3: 66,   // Уровень 3: 44-66 XP
    LEVEL_4: 88,   // Уровень 4: 66-88 XP
    LEVEL_5: 110   // Уровень 5: 88-110 XP (максимум 108 от пузырей + философия)
  } as const,
  
  // Lives System
  MAX_LIVES: 5,
  INITIAL_LIVES: 3,  // Стартовые жизни при первом запуске
  LIVES_PENALTY: 1,
  
  // Bubble Experience - опыт за уровни экспертизы
  XP_PER_BUBBLE: 5, // deprecated, используем XP_PER_EXPERTISE_LEVEL
  XP_PER_EASTER_EGG: 10,
  
  // XP за уровни экспертизы пузырей
  XP_PER_EXPERTISE_LEVEL: {
    novice: 1,
    intermediate: 2, 
    confident: 3,
    expert: 4,
    master: 5
  } as const,
  
  // Philosophy Questions XP/Lives
  PHILOSOPHY_CORRECT_XP: 10,      // +10 XP за правильный ответ
  PHILOSOPHY_WRONG_LIVES: 1,      // -1 жизнь за неправильный ответ
  
  // Game Over & Restart
  RESTART_YEAR: 2015,             // С какого года начинается игра заново
  GAME_OVER_BLOCK_BUBBLES: true,  // Блокировать пузыри при Game Over
  
  // Expertise Levels - Уровни экспертизы (с уменьшенными размерами)
  EXPERTISE_LEVELS: {
    novice: {
      name: 'Новичок',
      color: '#334155',
      sizeMultiplier: 0.75,
      opacity: 0.85,
      hasGradient: true,
      gradientColors: ['#334155', '#475569'], // Slate
    },
    intermediate: {
      name: 'С опытом',
      color: '#064E3B',
      sizeMultiplier: 0.8,
      opacity: 0.9,
      hasGradient: true,
      gradientColors: ['#064E3B', '#047857'], // Deep green
    },
    confident: {
      name: 'Уверенный',
      color: '#92400E',
      sizeMultiplier: 0.85,
      opacity: 0.93,
      hasGradient: true,
      gradientColors: ['#92400E', '#FBBF24'], // Amber
    },
    expert: {
      name: 'Эксперт',
      color: '#581C87',
      sizeMultiplier: 0.9,
      opacity: 0.95,
      hasGradient: true,
      gradientColors: ['#581C87', '#9333EA'], // Violet
    },
    master: {
      name: 'Мастер',
      color: '#B45309',
      sizeMultiplier: 0.95,
      opacity: 1,
      hasGradient: true,
      gradientColors: ['#F59E0B', '#D97706'], // Gold-Orange
    },
  } as const,

  // Philosophy Bubbles - Визуализация философских пузырей (исправленный размер)
  PHILOSOPHY_BUBBLE: {
    hasGradient: true,
    gradientColors: ['#FF0080', '#FF4080', '#FF8080', '#B3FF80', '#FFFFFF00'],
    sizeMultiplier: 0.9,           // Чуть меньше обычных пузырей (было -0.9)
    opacity: 0.95,
    name: 'Философский вопрос'
  } as const,
  
  // Animation Durations (ms)
  ANIMATION: {
    BUBBLE_HOVER: 300,
    LEVEL_UP: 1500,
    XP_GAIN: 800,
    MODAL_TRANSITION: 250,
    EXPERTISE_GLOW: 2000,        // Анимация свечения для высоких уровней
    MASTER_PULSE: 3000           // Пульсация для мастер-уровня
  } as const,
  
  // Timeline
  START_YEAR: 2000,
  CURRENT_YEAR: new Date().getFullYear(),
  
  // Canvas Dimensions
  CANVAS: {
    MIN_WIDTH: 800,
    MIN_HEIGHT: 600,
    PADDING: 50
  } as const,
  
  // D3 Force Simulation
  SIMULATION: {
    FORCE_STRENGTH: -300,
    COLLISION_RADIUS_MULTIPLIER: 1.5,
    CENTER_STRENGTH: 0.1,
    VELOCITY_DECAY: 0.4
  } as const
} as const

export type GameLevel = keyof typeof GAME_CONFIG.XP_LEVELS
export type AnimationType = keyof typeof GAME_CONFIG.ANIMATION
export type ExpertiseLevel = keyof typeof GAME_CONFIG.EXPERTISE_LEVELS
export type ExpertiseXPLevel = keyof typeof GAME_CONFIG.XP_PER_EXPERTISE_LEVEL 