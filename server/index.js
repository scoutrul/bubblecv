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
const PORT = process.env.PORT || 3002

// Database setup
const dbPath = join(__dirname, 'database.sqlite')
const db = new Database(dbPath)

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Для dev среды
}))
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(express.static(join(__dirname, '../dist')))

// Database initialization
const initDatabase = () => {
  try {
    // Создаем таблицы
    db.exec(`
      CREATE TABLE IF NOT EXISTS bubbles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        skill_level TEXT NOT NULL,
        year_started INTEGER NOT NULL,
        year_ended INTEGER,
        is_active BOOLEAN DEFAULT 1,
        is_easter_egg BOOLEAN DEFAULT 0,
        description TEXT,
        projects TEXT, -- JSON array
        link TEXT,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    
    console.log('📊 База данных инициализирована')
    
    // Инициализируем prepared statements после создания таблиц
    getBubbles = db.prepare('SELECT * FROM bubbles ORDER BY year_started, name')
    insertBubble = db.prepare(`
      INSERT INTO bubbles (id, name, category, skill_level, year_started, year_ended, is_active, is_easter_egg, description, projects, link, size, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    getSession = db.prepare('SELECT * FROM user_sessions WHERE id = ?')
    insertSession = db.prepare(`
      INSERT INTO user_sessions (id, current_xp, current_level, lives)
      VALUES (?, ?, ?, ?)
    `)
    updateSession = db.prepare(`
      UPDATE user_sessions 
      SET current_xp = ?, current_level = ?, lives = ?, unlocked_content = ?, visited_bubbles = ?, agreement_score = ?, last_activity = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error)
  }
}

// Prepared statements (будут инициализированы после создания таблиц)
let getBubbles, insertBubble, getSession, insertSession, updateSession

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
    const bubbles = getBubbles.all()
    const formattedBubbles = bubbles.map(bubble => ({
      ...bubble,
      projects: bubble.projects ? JSON.parse(bubble.projects) : [],
      isActive: Boolean(bubble.is_active),
      isEasterEgg: Boolean(bubble.is_easter_egg)
    }))
    
    res.json({
      success: true,
      data: formattedBubbles,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Ошибка получения пузырей:', error)
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
    let session = getSession.get(sessionId)
    
    if (!session) {
      // Создаем новую сессию
      insertSession.run(sessionId, 0, 1, 3)
      session = getSession.get(sessionId)
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
    console.error('Ошибка сессии:', error)
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
    
    updateSession.run(
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
    console.error('Ошибка обновления сессии:', error)
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
    const mockDataPath = join(__dirname, '../mockData.json')
    const philosophyPath = join(__dirname, '../philosophyQuestions.json')
    
    if (!fs.existsSync(mockDataPath)) {
      return res.status(404).json({
        success: false,
        error: 'Файл mockData.json не найден',
        timestamp: new Date().toISOString()
      })
    }
    
    const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'))
    const philosophyData = JSON.parse(fs.readFileSync(philosophyPath, 'utf8'))
    
    // Очищаем существующие данные
    db.exec('DELETE FROM bubbles')
    db.exec('DELETE FROM philosophy_questions')
    
    // Добавляем пузыри
    for (const bubble of mockData.bubbles) {
      insertBubble.run(
        bubble.id,
        bubble.label || bubble.name, // Используем label из JSON
        bubble.category,
        bubble.level || bubble.skillLevel, // level в JSON
        bubble.year || bubble.yearStarted, // year в JSON
        bubble.yearEnded || null,
        bubble.isActive !== false ? 1 : 0, // по умолчанию true
        bubble.isEasterEgg ? 1 : 0,
        bubble.description || bubble.insight,
        JSON.stringify(bubble.projects || []),
        bubble.projectLink || bubble.link || null,
        `bubble-${bubble.level}`, // генерируем размер из уровня
        '#667eea' // временный цвет
      )
    }
    
    console.log(`✅ Загружено ${mockData.bubbles.length} пузырей`)
    
    res.json({
      success: true,
      data: { 
        bubblesLoaded: mockData.bubbles.length,
        questionsLoaded: philosophyData.questions.length
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка загрузки данных',
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
  console.error('Ошибка сервера:', err)
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    timestamp: new Date().toISOString()
  })
})

// Start server
const startServer = async () => {
  try {
    initDatabase()
    
    app.listen(PORT, () => {
      console.log(`
🚀 Bubbles Resume Server запущен!
📍 URL: http://localhost:${PORT}
📊 API: http://localhost:${PORT}/api/health
🗄️  База данных: ${dbPath}
      `)
    })
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы сервера...')
  db.close()
  process.exit(0)
}) 