export const GAME_CONFIG = {
  // XP System
  XP_LEVELS: {
    LEVEL_1: 25,
    LEVEL_2: 50,
    LEVEL_3: 75,
    LEVEL_4: 100,
    LEVEL_5: 125
  } as const,
  
  // Lives System
  MAX_LIVES: 5,
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
  
  // Expertise Levels - Уровни экспертизы (с восстановленными градиентами)
  EXPERTISE_LEVELS: {
    novice: {
      color: '#D0F0FF',             // Яркий голубой
      sizeMultiplier: 0.95,
      opacity: 0.85,
      name: 'Новичок'
    },
    intermediate: {
      color: '#D2FFD2',             // Ярко-зелёный
      sizeMultiplier: 0.97,
      opacity: 0.9,
      name: 'С опытом'
    },
    confident: {
      color: '#FFF2CC',             // Золотисто-жёлтый
      sizeMultiplier: 1.0,
      opacity: 0.95,
      name: 'Уверенный'
    },
    expert: {
      color: '#E5CCFF',             // Сиреневый/аметист
      sizeMultiplier: 1,
      opacity: 0.95,
      name: 'Эксперт',
      hasGradient: true,
      gradientColors: ['#E5CCFF', '#D8B4FE', '#C084FC']
    },
    master: {
      color: '#FFC9DE',             // Розово-лососевый
      sizeMultiplier: 1,
      opacity: 0.95,
      name: 'Мастер',
      hasGradient: true,
      gradientColors: ['#FFC9DE', '#FBBF24', '#F59E0B']
    }
  } as const,

  // Philosophy Bubbles - Визуализация философских пузырей
  PHILOSOPHY_BUBBLE: {
    hasGradient: true,
    gradientColors: ['#FF0080', '#FF4080', '#FF8080', '#B3FF80', '#FFFFFF00'],
    sizeMultiplier: 0.6,           // Чуть больше обычных пузырей
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