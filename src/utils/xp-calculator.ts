import { SKILL_LEVELS, type SkillLevel } from '@/types/skill-levels'
import { GAME_CONFIG } from '@/config'

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
        return GAME_CONFIG.achievementXP.basic
      case 'tough-bubble-popper':
      case 'bubble-explorer-30':
        return GAME_CONFIG.achievementXP.intermediate
      case 'secret-bubble-discoverer':
      case 'bubble-explorer-10':
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