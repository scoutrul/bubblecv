import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import apiRoutes from './api'
import { seedDatabase } from './services/seeder'

const app = express()
const PORT = process.env.PORT || 3003

app.use(cors())
app.use(helmet())
app.use(compression())
app.use(express.json())

app.use('/api', apiRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log('🌱 Seeding database on startup...')
  seedDatabase()
}) 