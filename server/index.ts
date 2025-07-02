import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import { SKILL_LEVELS } from '../src/shared/constants/skill-levels'
import type { Bubble, SkillLevel } from '../src/shared/types'
import { existsSync, readFileSync } from 'fs'

// Map skill levels from any source to our canonical SkillLevel type
const SKILL_LEVEL_API_MAP: Record<string, SkillLevel> = {
  'novice': SKILL_LEVELS.NOVICE,
  'intermediate': SKILL_LEVELS.INTERMEDIATE,
  'advanced': SKILL_LEVELS.CONFIDENT, // Assuming advanced maps to confident
  'expert': SKILL_LEVELS.EXPERT,
  'master': SKILL_LEVELS.MASTER,
  'Новичок': SKILL_LEVELS.NOVICE,
  'Средний': SKILL_LEVELS.INTERMEDIATE,
  'Продвинутый': SKILL_LEVELS.CONFIDENT,
  'Эксперт': SKILL_LEVELS.EXPERT
};

type BetterSqlite3Database = any
type ExpressRequest = express.Request
type ExpressResponse = express.Response

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(express.json())

// Database setup
const setupDatabase = () => {
  const dbPath = join(__dirname, 'database.sqlite')
  
  let db: BetterSqlite3Database
  try {
    db = new Database(dbPath)
    
    // Создаем таблицы
    db.exec(`
      CREATE TABLE IF NOT EXISTS bubbles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        skillLevel TEXT NOT NULL,
        year INTEGER NOT NULL,
        isActive BOOLEAN DEFAULT true,
        isEasterEgg BOOLEAN DEFAULT false,
        isHidden BOOLEAN DEFAULT false,
        description TEXT,
        projects TEXT NOT NULL,
        isPopped BOOLEAN DEFAULT false,
        isVisited BOOLEAN DEFAULT false,
        size TEXT NOT NULL,
        color TEXT DEFAULT '#3b82f6',
        bubbleType TEXT DEFAULT 'regular',
        isTough BOOLEAN DEFAULT false,
        toughClicks INTEGER DEFAULT 3,
        currentClicks INTEGER DEFAULT 0,
        link TEXT,
        x REAL,
        y REAL,
        category TEXT DEFAULT 'general'
      );

      CREATE TABLE IF NOT EXISTS philosophy_questions (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correctAnswer INTEGER NOT NULL,
        explanation TEXT NOT NULL,
        skillLevel TEXT NOT NULL
      );
    `)
    
    const statements = {
      getBubbles: db.prepare('SELECT * FROM bubbles ORDER BY year, name'),
      insertBubble: db.prepare(`
        INSERT INTO bubbles (
          id, name, skillLevel, year, isActive, isEasterEgg, isHidden,
          description, projects, isPopped, isVisited, size, color,
          bubbleType, isTough, toughClicks, currentClicks, link, x, y, category
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `),
      insertPhilosophyQuestion: db.prepare(`
        INSERT INTO philosophy_questions (id, question, options, correctAnswer, explanation, skillLevel)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
    }
    
    return { db, statements }
  } catch (error: any) {
    console.error('❌ Ошибка инициализации БД: ' + error.message)
    process.exit(1)
  }
}

const { db, statements } = setupDatabase();

// Seeding function
const seedDatabase = () => {
  try {
    const mockDataPath = join(__dirname, 'data', 'mockData.json')
    const philosophyPath = join(__dirname, 'data', 'philosophyQuestions.json')
    
    console.log('📂 Mock data path:', mockDataPath)
    console.log('📂 Philosophy path:', philosophyPath)
    
    if (!existsSync(mockDataPath)) {
      console.log('❌ Mock data file not found at:', mockDataPath)
      throw new Error('Mock data file not found')
    }
    
    const mockData = JSON.parse(readFileSync(mockDataPath, 'utf8'))
    console.log('📊 Loaded mock data:', {
      bubblesCount: mockData.bubbles?.length || 0,
      hasBubblesArray: Array.isArray(mockData.bubbles),
      mockDataKeys: Object.keys(mockData)
    })

    if (!mockData.bubbles || !Array.isArray(mockData.bubbles)) {
      throw new Error('Invalid mock data structure: bubbles array is missing or not an array')
    }

    if (mockData.bubbles.length === 0) {
      throw new Error('Mock data contains empty bubbles array')
    }
    
    let philosophyData = []
    
    if (existsSync(philosophyPath)) {
      philosophyData = JSON.parse(readFileSync(philosophyPath, 'utf8'))
      console.log('📚 Loaded philosophy data:', {
        questionsCount: philosophyData.length
      })
    }
    
    db.exec('BEGIN TRANSACTION;')
    
    try {
      // Очищаем таблицы
      console.log('🧹 Cleaning up tables...')
      db.exec('DELETE FROM bubbles;')
      db.exec('DELETE FROM philosophy_questions;')

      // Группируем пузыри по годам для tough bubbles
      const bubblesByYear: Record<number, any[]> = {}
      mockData.bubbles.forEach((bubble: any) => {
        const year = bubble.year
        if (!bubblesByYear[year]) {
          bubblesByYear[year] = []
        }
        bubblesByYear[year].push(bubble)
      })

      console.log('📅 Grouped bubbles by year:', Object.keys(bubblesByYear).length, 'years')

      // Для каждого года выбираем один случайный пузырь и делаем его крепким
      Object.keys(bubblesByYear).forEach(yearStr => {
        const year = parseInt(yearStr)
        const bubblesInYear = bubblesByYear[year]
        if (bubblesInYear.length > 0) {
          const randomIndex = Math.floor(Math.random() * bubblesInYear.length)
          const randomBubble = bubblesInYear[randomIndex]
          randomBubble.isTough = true
          // randomBubble.toughClicks = Math.floor(Math.random() * 11) + 10 // Убрали, теперь это на фронте
          console.log(`💪 Made bubble tough for year ${year}:`, randomBubble.id)
        }
      })

      // Преобразуем пузыри для базы данных
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
        size: 'medium', // Size is now a client-side concern
        color: bubble.isTough ? '#FBBF24' : (bubble.color || '#667eea'),
        bubbleType: bubble.bubbleType || 'regular',
        isTough: !!bubble.isTough,
        toughClicks: bubble.toughClicks || 0,
        currentClicks: 0,
        link: bubble.projectLink || bubble.link || '',
        category: bubble.category || 'general'
      }))

      console.log('🔄 Transformed bubbles:', transformedBubbles.length)
      
      // Добавляем пузыри
      console.log('💾 Inserting bubbles...')
      for (const bubble of transformedBubbles) {
        try {
          statements.insertBubble.run([
            bubble.id,
            bubble.name,
            bubble.skillLevel,
            bubble.year,
            Number(bubble.isActive),
            Number(bubble.isEasterEgg),
            Number(bubble.isHidden),
            bubble.description,
            JSON.stringify(bubble.projects),
            Number(bubble.isPopped),
            Number(bubble.isVisited),
            bubble.size,
            bubble.color,
            bubble.bubbleType,
            Number(bubble.isTough),
            bubble.toughClicks,
            bubble.currentClicks,
            bubble.link,
            bubble.x,
            bubble.y,
            bubble.category
          ])
          console.log('✅ Inserted bubble:', bubble.id)
        } catch (error: any) {
          console.error('❌ Error inserting bubble:', bubble.id, error.message)
          throw error
        }
      }
      
      // Добавляем философские вопросы
      if (philosophyData.length > 0) {
        console.log('📚 Inserting philosophy questions...')
        for (const question of philosophyData) {
          try {
            statements.insertPhilosophyQuestion.run([
              question.id,
              question.question,
              JSON.stringify(question.options),
              question.correctAnswer,
              question.explanation,
              question.skillLevel
            ])
            console.log('✅ Inserted question:', question.id)
          } catch (error: any) {
            console.error('❌ Error inserting question:', question.id, error.message)
            throw error
          }
        }
      }
      
      db.exec('COMMIT;')
      console.log('✨ Database seeded successfully')
      
    } catch (error) {
      console.error('❌ Error during transaction, rolling back...')
      db.exec('ROLLBACK;')
      throw error
    }
    
  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message)
    if (error.stack) console.error(error.stack)
  }
}

// API Endpoints
app.get('/api/bubbles', (req: ExpressRequest, res: ExpressResponse) => {
  try {
    console.log('📊 Fetching bubbles from database...')
    const bubbles = statements.getBubbles.all()
    console.log('📊 Fetched bubbles:', {
      count: bubbles?.length || 0,
      sample: bubbles?.[0] ? { id: bubbles[0].id, name: bubbles[0].name } : null
    })
    res.json({ success: true, data: bubbles || [] })
  } catch (error: any) {
    console.error('❌ Error fetching bubbles:', error.message)
    res.status(500).json({ success: false, error: 'Failed to fetch bubbles' })
  }
})

app.post('/api/seed', (req: ExpressRequest, res: ExpressResponse) => {
  try {
    console.log('🌱 Starting database seeding...')
    seedDatabase()
    console.log('✅ Database seeding completed')
    res.json({ message: 'Database seeded successfully' })
  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
})

// API endpoint для получения уровней
app.get('/api/content-levels', (req, res) => {
  try {
    const filePath = join(__dirname, 'data', 'contentLevels.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.status(404).json({ error: 'Content levels data not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read content levels data' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log('🌱 Seeding database...')
  seedDatabase()
}) 