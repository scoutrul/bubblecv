import { SKILL_LEVELS } from '../constants/skill-levels'

export const GAME_CONFIG = {
  // XP System - значительно увеличены требования
  XP_LEVELS: {
    LEVEL_1: 50,   // Уровень 1: 0-50 XP
    LEVEL_2: 120,  // Уровень 2: 50-120 XP  
    LEVEL_3: 200,  // Уровень 3: 120-200 XP
    LEVEL_4: 300,  // Уровень 4: 200-300 XP
    LEVEL_5: 450   // Уровень 5: 300-450 XP
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
    [SKILL_LEVELS.NOVICE]: 1,
    [SKILL_LEVELS.INTERMEDIATE]: 2, 
    [SKILL_LEVELS.CONFIDENT]: 3,
    [SKILL_LEVELS.EXPERT]: 4,
    [SKILL_LEVELS.MASTER]: 5
  } as const,
  
  // Philosophy Questions XP/Lives
  PHILOSOPHY_CORRECT_XP: 10,      // +10 XP за правильный ответ
  PHILOSOPHY_WRONG_LIVES: 1,      // -1 жизнь за неправильный ответ
  
  // Game Over & Restart
  RESTART_YEAR: 2015,             // С какого года начинается игра заново
  GAME_OVER_BLOCK_BUBBLES: true,  // Блокировать пузыри при Game Over
  
  // Expertise Levels - Уровни экспертизы (с уменьшенными размерами)
  EXPERTISE_LEVELS: {
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
  } as const,

  // Hidden Bubble - визуализация особого скрытого пузыря
  HIDDEN_BUBBLE: {
    hasGradient: true,
    gradientColors: ['#00000000', '#64748B33', '#64748B11', '#FFFFFF00'], // почти прозрачный серо-голубой градиент
    sizeMultiplier: 0.85, // чуть меньше обычных
    opacity: 0.08, // очень высокая прозрачность
    name: 'Скрытый пузырь'
  } as const,
} as const

export type GameLevel = keyof typeof GAME_CONFIG.XP_LEVELS
export type AnimationType = keyof typeof GAME_CONFIG.ANIMATION
export type ExpertiseLevel = keyof typeof GAME_CONFIG.EXPERTISE_LEVELS
export type ExpertiseXPLevel = keyof typeof GAME_CONFIG.XP_PER_EXPERTISE_LEVEL 