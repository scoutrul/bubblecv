export type SkillLevel = 'novice' | 'intermediate' | 'advanced' | 'expert';

export interface Bubble {
  id: string;
  name: string;
  skillLevel: SkillLevel;
  year: number;
  isActive: boolean;
  isEasterEgg: boolean;
  isHidden?: boolean;
  description: string;
  projects: string[];
  isPopped: boolean;
  isVisited: boolean;
  size: string;
  color: string;
  isTough: boolean;
  toughClicks: number;
  currentClicks: number;
  link: string;
  category: string;
  bubbleType: 'hidden' | 'philosophy' | 'regular';
}

export interface PhilosophyQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  skillLevel: SkillLevel;
} 