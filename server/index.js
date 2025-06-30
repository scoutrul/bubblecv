import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3003

// Маппинг уровней навыков
const skillLevelMap = {
  'novice': 'beginner',
  'intermediate': 'intermediate',
  'confident': 'advanced',
  'expert': 'expert',
  'master': 'expert'
}

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
        skill_level TEXT NOT NULL,
        year_started INTEGER NOT NULL,
        year_ended INTEGER,
        is_active BOOLEAN DEFAULT true,
        is_easter_egg BOOLEAN DEFAULT false,
        is_tough BOOLEAN DEFAULT false,
        tough_clicks INTEGER DEFAULT 3,
        description TEXT,
        projects TEXT,
        link TEXT,
        size TEXT,
        color TEXT DEFAULT '#3b82f6',
        category TEXT NOT NULL DEFAULT 'general'
      );
      
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        current_xp INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        lives INTEGER DEFAULT 3,
        unlocked_content TEXT, -- JSON array
        visited_bubbles TEXT, -- JSON array
        agreement_score INTEGER DEFAULT 0,
        game_completed BOOLEAN DEFAULT 0,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        xp_reward INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS user_achievements (
        session_id TEXT,
        achievement_id TEXT,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (session_id, achievement_id),
        FOREIGN KEY (session_id) REFERENCES user_sessions(id),
        FOREIGN KEY (achievement_id) REFERENCES achievements(id)
      );
      
      CREATE TABLE IF NOT EXISTS philosophy_questions (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        context TEXT NOT NULL,
        agree_text TEXT NOT NULL,
        disagree_text TEXT NOT NULL,
        live_penalty INTEGER DEFAULT 1,
        is_easter_egg BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
          `)
    
    // Prepared statements
    const statements = {
      getBubbles: db.prepare('SELECT * FROM bubbles ORDER BY year_started, name'),
      insertBubble: db.prepare(`
        INSERT INTO bubbles (id, name, skill_level, year_started, year_ended, is_active, is_easter_egg, description, projects, link, size, color, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      insertPhilosophyQuestion: db.prepare(`
        INSERT INTO philosophy_questions (id, question, context, agree_text, disagree_text, live_penalty, is_easter_egg)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `),
      getSession: db.prepare('SELECT * FROM user_sessions WHERE id = ?'),
      insertSession: db.prepare(`
        INSERT INTO user_sessions (id, current_xp, current_level, lives)
        VALUES (?, ?, ?, ?)
      `),
      updateSession: db.prepare(`
        UPDATE user_sessions 
        SET current_xp = ?, current_level = ?, lives = ?, unlocked_content = ?, visited_bubbles = ?, agreement_score = ?, last_activity = CURRENT_TIMESTAMP
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
      isActive: Boolean(bubble.is_active),
      isEasterEgg: Boolean(bubble.is_easter_egg),
      isTough: Boolean(bubble.is_tough),
      toughClicks: bubble.tough_clicks || 3
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
        unlockedContent: session.unlocked_content ? JSON.parse(session.unlocked_content) : [],
        visitedBubbles: session.visited_bubbles ? JSON.parse(session.visited_bubbles) : [],
        gameCompleted: Boolean(session.game_completed)
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
    const { currentXP, currentLevel, lives, unlockedContent, visitedBubbles, agreementScore } = req.body
    
    statements.updateSession.run(
      currentXP,
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
        const params = [
          String(bubble.id),                    // id
          String(bubble.label || ''),           // name
          String(skillLevelMap[bubble.level] || 'beginner'),   // skill_level
          Number(bubble.year || 0),             // year_started
          null,                                 // year_ended
          Number(bubble.isActive === false ? 0 : 1),    // is_active
          Number(bubble.isEasterEgg ? 1 : 0),          // is_easter_egg
          String(bubble.description || ''),     // description
          '[]',                                 // projects (empty array)
          String(bubble.projectLink || ''),           // link
          String(`bubble-${skillLevelMap[bubble.level] || 'beginner'}`),     // size
          String(bubble.color || '#667eea'),    // color
          String(bubble.category || 'general')  // category
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
          String(question.id),                  // id
          String(question.question),            // question
          String(question.insight || ''),       // context
          String(agreeOption.text),            // agree_text
          String(disagreeOption.text),         // disagree_text
          Number(disagreeOption.livesLost || 1), // live_penalty
          Number(question.isEasterEgg ? 1 : 0)         // is_easter_egg
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
    app.listen(PORT, () => {
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