import { api } from '@/api'

export interface ChatContext {
  skillsCount: number
  projectsCount: number
  achievementsCount: number
  technologies: string[]
  gameModes: string[]
  architecture: string[]
}

export async function buildChatContext(): Promise<ChatContext> {
  try {
    const [skills, projects, achievements] = await Promise.all([
      api.getBubbles(),
      api.getProjectBubbles(),
      api.getAchievements()
    ])

    // Собираем уникальные технологии из навыков
    const technologies = [...new Set(
      skills.data.map(skill => skill.skillLevel).filter(Boolean)
    )]

    // Игровые режимы
    const gameModes = ['Career', 'Project', 'Retro']

    // Архитектурные паттерны
    const architecture = [
      'Clean Architecture',
      'Use Cases',
      'Repository Pattern', 
      'Pinia Stores',
      'Composables'
    ]

    return {
      skillsCount: skills.data.length,
      projectsCount: projects.data.length,
      achievementsCount: achievements.data.length,
      technologies,
      gameModes,
      architecture
    }
  } catch (error) {
    console.error('Error building chat context:', error)
    // Возвращаем базовый контекст при ошибке
    return {
      skillsCount: 0,
      projectsCount: 0,
      achievementsCount: 0,
      technologies: ['novice', 'intermediate', 'confident', 'expert', 'master'],
      gameModes: ['Career', 'Project', 'Retro'],
      architecture: ['Clean Architecture', 'Use Cases', 'Repository Pattern']
    }
  }
}

export function formatContextForPrompt(context: ChatContext): string {
  return `
ДОПОЛНИТЕЛЬНЫЙ КОНТЕКСТ:
- Навыков в игре: ${context.skillsCount}
- Проектов: ${context.projectsCount} 
- Достижений: ${context.achievementsCount}
- Уровни навыков: ${context.technologies.join(', ')}
- Режимы игры: ${context.gameModes.join(', ')}
- Архитектура: ${context.architecture.join(', ')}
`
}
