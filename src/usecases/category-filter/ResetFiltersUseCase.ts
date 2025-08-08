import type { CategoryFilterStore, ResetFiltersResponse } from './types'

export class ResetFiltersUseCase {
  constructor(private categoryFilterStore: CategoryFilterStore) {}

  execute(): ResetFiltersResponse {
    // Reset all filters
    this.categoryFilterStore.resetFilters()
    
    // Save to localStorage
    this.categoryFilterStore.saveToLocalStorage()
    
    return {
      selectedCategories: []
    }
  }

  hasActiveFilters(): boolean {
    return this.categoryFilterStore.hasActiveFilters
  }

  getActiveFilterCount(): number {
    return this.categoryFilterStore.activeFilterCount
  }
} 