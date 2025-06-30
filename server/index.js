import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import { SKILL_LEVEL_API_MAP } from '../src/shared/constants/skill-levels'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3003

// Маппинг уровней навыков
const skillLevelMap = SKILL_LEVEL_API_MAP

// Database setup
const setupDatabase = () => {
  const dbPath = join(__dirname, 'database.sqlite')
  
  let db
  try {
    db = new Database(dbPath)
    
    // Создаем таблицы
    db.exec(`
      CREATE TABLE IF NOT EXISTS bubbles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        skillLevel TEXT NOT NULL,
        yearStarted INTEGER NOT NULL,
        yearEnded INTEGER,
        isActive BOOLEAN DEFAULT true,
        isEasterEgg BOOLEAN DEFAULT false,
        isTough BOOLEAN DEFAULT false,
        toughClicks INTEGER DEFAULT 3,
        description TEXT,
        projects TEXT,
        link TEXT,
        size TEXT,
        color TEXT DEFAULT '#3b82f6',
        category TEXT NOT NULL DEFAULT 'general'
      );
      
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        currentXp INTEGER DEFAULT 0,
        currentLevel INTEGER DEFAULT 1,
        lives INTEGER DEFAULT 3,
        unlockedContent TEXT, -- JSON array
        visitedBubbles TEXT, -- JSON array
        agreementScore INTEGER DEFAULT 0,
        gameCompleted BOOLEAN DEFAULT 0,
        startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastActivity DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        xpReward INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS user_achievements (
        sessionId TEXT,
        achievementId TEXT,
        unlockedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (sessionId, achievementId),
        FOREIGN KEY (sessionId) REFERENCES user_sessions(id),
        FOREIGN KEY (achievementId) REFERENCES achievements(id)
      );
      
      CREATE TABLE IF NOT EXISTS philosophy_questions (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        context TEXT NOT NULL,
        agreeText TEXT NOT NULL,
        disagreeText TEXT NOT NULL,
        livePenalty INTEGER DEFAULT 1,
        isEasterEgg BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
          `)
    
    // Prepared statements
    const statements = {
      getBubbles: db.prepare('SELECT * FROM bubbles ORDER BY yearStarted, name'),
      insertBubble: db.prepare(`
        INSERT INTO bubbles (id, name, skillLevel, yearStarted, yearEnded, isActive, isEasterEgg, isTough, toughClicks, description, projects, link, size, color, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      insertPhilosophyQuestion: db.prepare(`
        INSERT INTO philosophy_questions (id, question, context, agreeText, disagreeText, livePenalty, isEasterEgg)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `),
      getSession: db.prepare('SELECT * FROM user_sessions WHERE id = ?'),
      insertSession: db.prepare(`
        INSERT INTO user_sessions (id, currentXp, currentLevel, lives)
        VALUES (?, ?, ?, ?)
      `),
      updateSession: db.prepare(`
        UPDATE user_sessions 
        SET currentXp = ?, currentLevel = ?, lives = ?, unlockedContent = ?, visitedBubbles = ?, agreementScore = ?, lastActivity = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
    }
    
    return { db, statements, dbPath }
  } catch (error) {
    console.error('❌ Ошибка инициализации БД: ' + error.message)
    process.exit(1)
  }
}

// Инициализируем базу данных
const { db, statements, dbPath } = setupDatabase()

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Для dev среды
}))
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(express.static(join(__dirname, '../dist')))

// Seeding function
const seedDatabase = () => {
  try {
    // Читаем данные из JSON файлов
    const mockDataPath = join(__dirname, '../src/shared/data/mockData.json')
    const philosophyPath = join(__dirname, '../src/shared/data/philosophyQuestions.json')
    
    if (!fs.existsSync(mockDataPath) || !fs.existsSync(philosophyPath)) {
      console.log('🌱 Seed files not found, skipping seeding.')
      return
    }
    
    const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'))
    const philosophyData = JSON.parse(fs.readFileSync(philosophyPath, 'utf8'))
    
    // Очищаем существующие данные
    db.exec('DELETE FROM bubbles')
    db.exec('DELETE FROM philosophy_questions')

    // Добавляем пузыри
    for (const bubble of mockData.bubbles) {
      try {
        const isTough = bubble.label === 'JavaScript';
        const toughClicks = isTough ? 5 : 0;
        const color = isTough ? '#FBBF24' : (bubble.color || '#667eea');

        const params = [
          String(bubble.id),
          String(bubble.label || ''),
          String(skillLevelMap[bubble.level] || 'beginner'),
          Number(bubble.year || 0),
          null,
          Number(bubble.isActive === false ? 0 : 1),
          Number(bubble.isEasterEgg ? 1 : 0),
          isTough ? 1 : 0,
          toughClicks,
          String(bubble.description || ''),
          '[]',
          String(bubble.projectLink || ''),
          String(`bubble-${skillLevelMap[bubble.level] || 'beginner'}`),
          color,
          String(bubble.category || 'general')
        ]
        
        statements.insertBubble.run(params)
      } catch (error) {
        console.error(`❌ Ошибка добавления пузыря ${bubble.id}:`, error)
      }
    }
    
    // Добавляем философские вопросы
    for (const question of philosophyData.questions) {
      try {
        const agreeOption = question.options.reduce((max, opt) => opt.agreementLevel > max.agreementLevel ? opt : max, question.options[0])
        const disagreeOption = question.options.reduce((min, opt) => opt.agreementLevel < min.agreementLevel ? opt : min, question.options[0])
        
        const params = [
          String(question.id),
          String(question.question),
          String(question.insight || ''),
          String(agreeOption.text),
          String(disagreeOption.text),
          Number(disagreeOption.livesLost || 1),
          Number(question.isEasterEgg ? 1 : 0)
        ]
        
        statements.insertPhilosophyQuestion.run(params)
      } catch (error) {
        console.error(`❌ Ошибка добавления вопроса ${question.id}:`, error)
      }
    }
    console.log('🌱 Database seeded successfully.')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Получить все пузыри
app.get('/api/bubbles', (req, res) => {
  try {
    const bubbles = statements.getBubbles.all()
    const formattedBubbles = bubbles.map(bubble => ({
      ...bubble,
      projects: bubble.projects ? JSON.parse(bubble.projects) : [],
    }))
    
    res.json({
      success: true,
      data: formattedBubbles,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера',
      timestamp: new Date().toISOString()
    })
  }
})

// Получить/создать сессию пользователя
app.get('/api/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params
    let session = statements.getSession.get(sessionId)
    
    if (!session) {
      // Создаем новую сессию
      const result = statements.insertSession.run(sessionId, 0, 1, 3)
      session = statements.getSession.get(sessionId)
    }
    
    res.json({
      success: true,
      data: {
        ...session,
        unlockedContent: session.unlockedContent ? JSON.parse(session.unlockedContent) : [],
        visitedBubbles: session.visitedBubbles ? JSON.parse(session.visitedBubbles) : [],
        gameCompleted: Boolean(session.gameCompleted)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера',
      timestamp: new Date().toISOString()
    })
  }
})

// Обновить сессию пользователя
app.put('/api/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params
    const { currentXp, currentLevel, lives, unlockedContent, visitedBubbles, agreementScore } = req.body
    
    statements.updateSession.run(
      currentXp,
      currentLevel,
      lives,
      JSON.stringify(unlockedContent || []),
      JSON.stringify(visitedBubbles || []),
      agreementScore || 0,
      sessionId
    )
    
    res.json({
      success: true,
      data: { message: 'Сессия обновлена' },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера',
      timestamp: new Date().toISOString()
    })
  }
})

// Загрузить моковые данные
app.post('/api/seed', async (req, res) => {
  try {
    // Читаем данные из JSON файлов
    const mockDataPath = join(__dirname, '../src/shared/data/mockData.json')
    const philosophyPath = join(__dirname, '../src/shared/data/philosophyQuestions.json')
    
    if (!fs.existsSync(mockDataPath)) {
      return res.status(404).json({
        success: false,
        error: 'Файл mockData.json не найден',
        timestamp: new Date().toISOString()
      })
    }
    
    if (!fs.existsSync(philosophyPath)) {
      return res.status(404).json({
        success: false,
        error: 'Файл philosophyQuestions.json не найден',
        timestamp: new Date().toISOString()
      })
    }
    
    const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'))
    const philosophyData = JSON.parse(fs.readFileSync(philosophyPath, 'utf8'))
    
    // Очищаем существующие данные
    db.exec('DELETE FROM bubbles')
    db.exec('DELETE FROM philosophy_questions')
    for (const bubble of mockData.bubbles) {
      try {
        const isTough = bubble.label === 'JavaScript';
        const toughClicks = isTough ? 5 : 0;
        const color = isTough ? '#FBBF24' : (bubble.color || '#667eea');

        const params = [
          String(bubble.id),
          String(bubble.label || ''),
          String(skillLevelMap[bubble.level] || 'beginner'),
          Number(bubble.year || 0),
          null,
          Number(bubble.isActive === false ? 0 : 1),
          Number(bubble.isEasterEgg ? 1 : 0),
          isTough ? 1 : 0,
          toughClicks,
          String(bubble.description || ''),
          '[]',
          String(bubble.projectLink || ''),
          String(`bubble-${skillLevelMap[bubble.level] || 'beginner'}`),
          color,
          String(bubble.category || 'general')
        ]
        
        statements.insertBubble.run(params)
      } catch (error) {
        console.error(`❌ Ошибка добавления пузыря ${bubble.id}:`, error)
        throw error
      }
    }
    
    // Добавляем философские вопросы
    for (const question of philosophyData.questions) {
      try {
        // Находим опцию с максимальным agreementLevel для agree_text
        const agreeOption = question.options.reduce((max, opt) => 
          opt.agreementLevel > max.agreementLevel ? opt : max
        , question.options[0])
        
        // Находим опцию с минимальным agreementLevel для disagree_text
        const disagreeOption = question.options.reduce((min, opt) => 
          opt.agreementLevel < min.agreementLevel ? opt : min
        , question.options[0])
        
        const params = [
          String(question.id),
          String(question.question),
          String(question.insight || ''),
          String(agreeOption.text),
          String(disagreeOption.text),
          Number(disagreeOption.livesLost || 1),
          Number(question.isEasterEgg ? 1 : 0)
        ]
        
        statements.insertPhilosophyQuestion.run(params)
      } catch (error) {
        console.error(`❌ Ошибка добавления вопроса ${question.id}:`, error)
        throw error
      }
    }
    
    res.json({
      success: true,
      data: { 
        bubblesLoaded: mockData.bubbles.length,
        questionsLoaded: philosophyData.questions.length
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка загрузки данных',
      details: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'))
})

// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    timestamp: new Date().toISOString()
  })
})

// Start server
const startServer = async () => {
  try {
    seedDatabase(); // Заполняем БД при старте
    app.listen(PORT, () => {
      console.log(`🚀 Server listening at http://localhost:${PORT}`);
    })
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on('SIGINT', () => {
  db.close()
  process.exit(0)
}) 