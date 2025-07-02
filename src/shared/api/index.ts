import mockData from '../data/mockData.json'
import contentLevels from '../data/contentLevels.json'

const API_BASE_URL = '/api'

export const api = {
  async getContentLevels() {
    return { data: contentLevels }
  },
  
  async getBubbles() {
    // Проверка наличия и структуры bubbles в mockData
    if (!mockData.bubbles || !Array.isArray(mockData.bubbles)) {
      throw new Error('Invalid mock data structure: bubbles array is missing or not an array')
    }
    return { data: mockData.bubbles }
  }
} 