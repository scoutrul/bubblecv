import type { SkillLevel } from './types.js';

export const SKILL_LEVEL_API_MAP: Record<string, SkillLevel> = {
  'novice': 'novice',
  'intermediate': 'intermediate',
  'advanced': 'advanced',
  'expert': 'expert',
  'master': 'expert', // map master to expert since we don't have master in SkillLevel type
  'Новичок': 'novice',
  'Средний': 'intermediate',
  'Продвинутый': 'advanced',
  'Эксперт': 'expert'
}; 