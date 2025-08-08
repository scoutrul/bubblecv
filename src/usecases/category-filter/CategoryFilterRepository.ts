import type { NormalizedBubble } from '@/types/normalized'
import type { CategoryFilterRepository, CategoryInfo } from './types'

interface CategoryIndex {
  [categoryId: string]: {
    bubbles: NormalizedBubble[]
    count: number
    lastUpdated: number
  }
}

export class CategoryFilterRepositoryImpl implements CategoryFilterRepository {
  private categoryIndex: CategoryIndex = {}
  private lastBubbleCount = 0

  getBubbles(): NormalizedBubble[] {
    // This will be injected from the bubble store
    return []
  }

  getCategories(): CategoryInfo[] {
    const bubbles = this.getBubbles()
    const index = this.buildCategoryIndex(bubbles)
    return this.calculateCategoryStats(bubbles, index)
  }

  applyFilters(bubbles: NormalizedBubble[], selectedCategories: string[]): NormalizedBubble[] {
    // If no filters selected, return all bubbles
    if (selectedCategories.length === 0) {
      return bubbles
    }

    // Use index for efficient filtering
    const index = this.buildCategoryIndex(bubbles)
    const filteredBubblesMap = new Map<number, NormalizedBubble>()

    for (const category of selectedCategories) {
      const categoryData = index[category]
      if (categoryData) {
        for (const bubble of categoryData.bubbles) {
          filteredBubblesMap.set(bubble.id, bubble)
        }
      }
    }

    return Array.from(filteredBubblesMap.values())
  }

  private buildCategoryIndex(bubbles: NormalizedBubble[]): CategoryIndex {
    // Only rebuild if bubbles changed
    if (bubbles.length === this.lastBubbleCount && Object.keys(this.categoryIndex).length > 0) {
      return this.categoryIndex
    }

    const index: CategoryIndex = {}
    
    for (const bubble of bubbles) {
      const category = bubble.category || 'uncategorized'
      
      if (!index[category]) {
        index[category] = {
          bubbles: [],
          count: 0,
          lastUpdated: Date.now()
        }
      }
      
      index[category].bubbles.push(bubble)
      index[category].count++
    }

    this.categoryIndex = index
    this.lastBubbleCount = bubbles.length
    
    return index
  }

  private calculateCategoryStats(bubbles: NormalizedBubble[], categoryIndex: CategoryIndex): CategoryInfo[] {
    const stats: CategoryInfo[] = []
    
    for (const [categoryId, categoryData] of Object.entries(categoryIndex)) {
      stats.push({
        id: categoryId,
        name: this.getCategoryDisplayName(categoryId),
        count: categoryData.count,
        isSelected: false // Will be set by store
      })
    }
    
    // Sort by count descending, then by name
    return stats.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count
      }
      return a.name.localeCompare(b.name)
    })
  }

  private getCategoryDisplayName(categoryId: string): string {
    const categoryNames: Record<string, string> = {
      'frontend': 'Frontend',
      'backend': 'Backend',
      'database': 'Database',
      'infrastructure': 'Infrastructure',
      'server': 'Server',
      'design': 'Design',
      'cms': 'CMS',
      '3d': '3D',
      'marketing': 'Marketing',
      'build': 'Build Tools',
      'framework': 'Framework',
      'architecture': 'Architecture',
      'life': 'Life',
      'games': 'Games',
      'hardware': 'Hardware',
      'internet': 'Internet',
      'work': 'Work',
      'freelance': 'Freelance',
      'uncategorized': 'Uncategorized'
    }

    return categoryNames[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
  }
} 