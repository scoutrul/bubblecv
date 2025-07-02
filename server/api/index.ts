import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { statements } from '../services/database'
import { seedDatabase } from '../services/seeder'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.get('/bubbles', (req, res) => {
  try {
    const bubbles = statements.getBubbles.all()
    res.json({ success: true, data: bubbles || [] })
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch bubbles' })
  }
})

router.post('/seed', (req, res) => {
  try {
    seedDatabase()
    res.json({ message: 'Database seeded successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
})

router.get('/content-levels', (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'contentLevels.json');
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

export default router 