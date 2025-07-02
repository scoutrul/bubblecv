import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync, readFileSync } from 'fs'
import { db, statements } from './database'
import { SKILL_LEVELS } from '../../src/shared/constants/skill-levels'
import type { Bubble, SkillLevel } from '../../src/shared/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SKILL_LEVEL_API_MAP: Record<string, SkillLevel> = {
  'novice': SKILL_LEVELS.NOVICE,
  'intermediate': SKILL_LEVELS.INTERMEDIATE,
  'advanced': SKILL_LEVELS.CONFIDENT,
  'expert': SKILL_LEVELS.EXPERT,
  'master': SKILL_LEVELS.MASTER,
  'Новичок': SKILL_LEVELS.NOVICE,
  'Средний': SKILL_LEVELS.INTERMEDIATE,
  'Продвинутый': SKILL_LEVELS.CONFIDENT,
  'Эксперт': SKILL_LEVELS.EXPERT
};

export const seedDatabase = () => {
  try {
    const mockDataPath = path.join(__dirname, '..', 'data', 'mockData.json')
    const philosophyPath = path.join(__dirname, '..', 'data', 'philosophyQuestions.json')
    
    if (!existsSync(mockDataPath)) {
      throw new Error('Mock data file not found')
    }
    
    const mockData = JSON.parse(readFileSync(mockDataPath, 'utf8'))

    if (!mockData.bubbles || !Array.isArray(mockData.bubbles) || mockData.bubbles.length === 0) {
      throw new Error('Invalid or empty mock data for bubbles')
    }
    
    let philosophyData = []
    if (existsSync(philosophyPath)) {
      philosophyData = JSON.parse(readFileSync(philosophyPath, 'utf8'))
    }
    
    db.exec('BEGIN TRANSACTION;')
    
    try {
      db.exec('DELETE FROM bubbles;')
      db.exec('DELETE FROM philosophy_questions;')

      const bubblesByYear: Record<number, any[]> = {}
      mockData.bubbles.forEach((bubble: any) => {
        const year = bubble.year
        if (!bubblesByYear[year]) {
          bubblesByYear[year] = []
        }
        bubblesByYear[year].push(bubble)
      })

      Object.keys(bubblesByYear).forEach(yearStr => {
        const year = parseInt(yearStr)
        const bubblesInYear = bubblesByYear[year]
        if (bubblesInYear.length > 0) {
          const randomIndex = Math.floor(Math.random() * bubblesInYear.length)
          bubblesInYear[randomIndex].isTough = true
        }
      })

      const transformedBubbles = mockData.bubbles.map((bubble: any): Bubble => ({
        id: bubble.id,
        name: bubble.name || bubble.label || '',
        skillLevel: (SKILL_LEVEL_API_MAP[bubble.skillLevel || bubble.level] || SKILL_LEVELS.NOVICE),
        year: bubble.year,
        isActive: bubble.isActive !== false,
        isEasterEgg: !!bubble.isEasterEgg,
        isHidden: !!bubble.isHidden,
        description: bubble.description || '',
        projects: bubble.projects || [],
        isPopped: false,
        isVisited: false,
        size: 'medium',
        color: bubble.isTough ? '#FBBF24' : (bubble.color || '#667eea'),
        bubbleType: bubble.bubbleType || 'regular',
        isTough: !!bubble.isTough,
        toughClicks: bubble.toughClicks || 0,
        currentClicks: 0,
        link: bubble.projectLink || bubble.link || '',
        category: bubble.category || 'general'
      }))

      for (const bubble of transformedBubbles) {
        statements.insertBubble.run(
            bubble.id, bubble.name, bubble.skillLevel, bubble.year,
            Number(bubble.isActive), Number(bubble.isEasterEgg), Number(bubble.isHidden),
            bubble.description, JSON.stringify(bubble.projects), Number(bubble.isPopped),
            Number(bubble.isVisited), bubble.size, bubble.color, bubble.bubbleType,
            Number(bubble.isTough), bubble.toughClicks, bubble.currentClicks, bubble.link,
            bubble.x, bubble.y, bubble.category
        )
      }
      
      if (philosophyData.length > 0) {
        for (const question of philosophyData) {
          statements.insertPhilosophyQuestion.run(
            question.id, question.question, JSON.stringify(question.options),
            question.correctAnswer, question.explanation, question.skillLevel
          )
        }
      }
      
      db.exec('COMMIT;')
      console.log('✨ Database seeded successfully')
      
    } catch (error) {
      db.exec('ROLLBACK;')
      throw error
    }
    
  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message)
    if (error.stack) console.error(error.stack)
  }
} 