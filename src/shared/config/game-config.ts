export const GAME_CONFIG = {
  // XP System
  XP_LEVELS: {
    LEVEL_1: 25,
    LEVEL_2: 50,
    LEVEL_3: 75,
    LEVEL_4: 100
  } as const,
  
  // Lives System
  MAX_LIVES: 3,
  LIVES_PENALTY: 1,
  
  // Bubble Experience
  XP_PER_BUBBLE: 5,
  XP_PER_EASTER_EGG: 10,
  
  // Animation Durations (ms)
  ANIMATION: {
    BUBBLE_HOVER: 300,
    LEVEL_UP: 1500,
    XP_GAIN: 800,
    MODAL_TRANSITION: 250
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