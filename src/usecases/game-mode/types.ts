export enum GameMode {
  CAREER = 'career',
  PROJECT = 'project'
}

export interface GameModeInfo {
  mode: GameMode
  title: string
  description: string
}

export const GAME_MODE_INFO: Record<GameMode, GameModeInfo> = {
  [GameMode.CAREER]: {
    mode: GameMode.CAREER,
    title: 'Карьерный путь',
    description: 'История развития и опыт разработчика'
  },
  [GameMode.PROJECT]: {
    mode: GameMode.PROJECT,
    title: 'Технологии проекта',
    description: 'Навыки и технологии, необходимые для создания подобного проекта'
  }
} 