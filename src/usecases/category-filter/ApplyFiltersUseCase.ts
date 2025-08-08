import type { CategoryFilterRepository, ApplyFiltersRequest, ApplyFiltersResponse } from './types'

export class ApplyFiltersUseCase {
  constructor(private categoryFilterRepository: CategoryFilterRepository) {}

  execute(request: ApplyFiltersRequest): ApplyFiltersResponse {
    const { bubbles, selectedCategories } = request
    
    // Apply filters using the repository
    const filteredBubbles = this.categoryFilterRepository.applyFilters(bubbles, selectedCategories)
    
    return {
      filteredBubbles
    }
  }
} 