import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { join } from 'path'

type BetterSqlite3Database = any

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const setupDatabase = () => {
  const dbPath = join(__dirname, '..', 'database.sqlite')
  
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

export const { db, statements } = setupDatabase() 