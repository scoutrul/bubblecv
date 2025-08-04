import { GAME_CONFIG } from '@/config'

// Функции для расчета прогрессивных параметров физики по уровням
export const PHYSICS_CALCULATOR = {
  // Рассчитывает множитель для уровня (каждые 2 уровня - удвоение)
  getLevelMultiplier: (level: number): number => {
    if (level <= 1) return 1
    // Каждые 2 уровня увеличиваем в 2 раза
    const levelGroup = Math.floor((level - 1) / 2)
    const baseMultiplier = Math.pow(2, levelGroup)
    // Промежуточные уровни получают пропорциональное увеличение
    const levelInGroup = (level - 1) % 2
    if (levelInGroup === 0) return baseMultiplier
    return baseMultiplier * (1 + levelInGroup * 0.5) // Промежуточный уровень +50%
  },

  // Получает параметры движения бабблов для конкретного уровня
  getBubblePhysics: (level: number) => {
    const multiplier = PHYSICS_CALCULATOR.getLevelMultiplier(level)
    const base = GAME_CONFIG.bubblePhysicsBase
    
    // Ограничиваем максимальный множитель для движения
    const limitedMultiplier = Math.min(multiplier, 2.5) // Максимум в 2.5 раза сильнее базовых значений
    
    return {
      gravityStrength: base.gravityStrength * Math.min(limitedMultiplier, 1.8), // Уменьшена максимальная сила притяжения
      vortexStrength: base.vortexStrength * Math.min(limitedMultiplier, 3), // Увеличена максимальная скорость воронки
      oscillationStrength: base.oscillationStrength * Math.min(limitedMultiplier, 3), // Увеличена максимальная скорость колебаний
      randomStrength: base.randomStrength * Math.min(limitedMultiplier, 2.5), // Увеличена максимальная случайная скорость
      dampingFactor: Math.max(0.8, base.dampingFactor - (limitedMultiplier - 1) * 0.02), // Уменьшаем затухание для более быстрого движения
      velocityMultiplier: base.velocityMultiplier * Math.min(limitedMultiplier, 3) // Увеличена максимальная скорость от отталкивания
    }
  },

  // Получает параметры физики взрыва для конкретного уровня
  getExplosionPhysics: (level: number) => {
    const multiplier = PHYSICS_CALCULATOR.getLevelMultiplier(level)
    const base = GAME_CONFIG.explosionPhysicsBase
    
    // Ограничиваем максимальный множитель для предотвращения слишком сильных эффектов
    const limitedMultiplier = Math.min(multiplier, 3) // Максимум в 3 раза сильнее базовых значений
    
    return {
      pushForceMultiplier: base.pushForceMultiplier * Math.min(limitedMultiplier, 2),
      pushMaxVelocity: base.pushMaxVelocity * Math.min(limitedMultiplier, 1.5),
      explosionForceMultiplier: base.explosionForceMultiplier * Math.min(limitedMultiplier, 2),
      explosionMaxVelocity: base.explosionMaxVelocity * Math.min(limitedMultiplier, 1.5),
      explosionRadiusMultiplier: base.explosionRadiusMultiplier * Math.min(Math.sqrt(limitedMultiplier), 1.5),
      explosionStrengthBase: base.explosionStrengthBase * Math.min(limitedMultiplier, 2),
      bubbleExplosionRadiusMultiplier: base.bubbleExplosionRadiusMultiplier * Math.min(Math.sqrt(limitedMultiplier), 1.3),
      bubbleExplosionStrengthBase: base.bubbleExplosionStrengthBase * Math.min(limitedMultiplier, 1.8),
      hoverPushRadiusMultiplier: base.hoverPushRadiusMultiplier * Math.min(Math.sqrt(limitedMultiplier), 1.5),
      hoverPushStrengthBase: base.hoverPushStrengthBase * Math.min(limitedMultiplier, 2),
      bubbleJumpBaseStrength: base.bubbleJumpBaseStrength * Math.min(limitedMultiplier, 1.8),
      bubbleJumpClickMultiplier: base.bubbleJumpClickMultiplier * Math.min(Math.sqrt(limitedMultiplier), 1.3)
    }
  },

  // Получает параметры симуляции D3 для конкретного уровня
  getSimulationPhysics: (level: number) => {
    const multiplier = PHYSICS_CALCULATOR.getLevelMultiplier(level)
    const base = GAME_CONFIG.simulationPhysicsBase
    
    // Ограничиваем максимальный множитель для симуляции
    const limitedMultiplier = Math.min(multiplier, 2) // Максимум в 2 раза сильнее базовых значений
    
    return {
      centerForceStrength: base.centerForceStrength * Math.min(limitedMultiplier, 1.5), // Уменьшена максимальная сила центра
      collisionForceStrength: Math.min(0.95, base.collisionForceStrength * Math.sqrt(limitedMultiplier)), // Ограничиваем до 0.95
      chargeForceStrength: base.chargeForceStrength * Math.min(limitedMultiplier, 2), // Увеличена сила заряда для более быстрого движения
      attractForceStrength: base.attractForceStrength * Math.min(limitedMultiplier, 1.5), // Уменьшена максимальная сила притяжения
      alphaBase: Math.min(0.8, base.alphaBase * Math.sqrt(limitedMultiplier)), // Увеличена максимальная alpha для более быстрой симуляции
      velocityDecay: Math.max(0.75, base.velocityDecay - (limitedMultiplier - 1) * 0.02), // Уменьшаем затухание для более быстрого движения
      restartInterval: Math.max(1200, base.restartInterval / Math.sqrt(limitedMultiplier)) // Уменьшаем интервал для более частого обновления
    }
  }
} as const 