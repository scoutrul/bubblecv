import type { CategoryFilterRepository, CategoryFilterStore, GetCategoriesRequest, GetCategoriesResponse, CategoryInfo } from './types'

export class GetCategoriesUseCase {
  constructor(
    private categoryFilterRepository: CategoryFilterRepository,
    private categoryFilterStore: CategoryFilterStore
  ) {}

  execute(request: GetCategoriesRequest): GetCategoriesResponse {
    const categories = this.categoryFilterRepository.getCategories()
    
    // Update store with available categories
    this.categoryFilterStore.setAvailableCategories(categories)
    
    // Update isSelected state based on current selection
    categories.forEach(category => {
      category.isSelected = this.categoryFilterStore.selectedCategories.includes(category.id)
    })
    
    return { categories }
  }

  getCategoriesWithCounts(): CategoryInfo[] {
    return this.categoryFilterStore.availableCategories
  }

  getCategoryCount(): number {
    return this.categoryFilterStore.availableCategories.length
  }

  getTotalBubbleCount(): number {
    return this.categoryFilterStore.availableCategories.reduce((total, cat) => total + cat.count, 0)
  }
} 