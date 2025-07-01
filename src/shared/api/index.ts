const API_BASE_URL = '/api'

export const api = {
  async getContentLevels() {
    const response = await fetch(`${API_BASE_URL}/content-levels`)
    if (!response.ok) {
      throw new Error('Failed to fetch content levels')
    }
    return response.json()
  },
  
  async getBubbles() {
    const response = await fetch(`${API_BASE_URL}/bubbles`)
    if (!response.ok) {
      throw new Error('Failed to fetch bubbles')
    }
    return response.json()
  }
} 