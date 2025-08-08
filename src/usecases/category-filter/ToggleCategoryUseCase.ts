import type { CategoryFilterStore, ToggleCategoryRequest, ToggleCategoryResponse } from './types'

export class ToggleCategoryUseCase {
  constructor(private categoryFilterStore: CategoryFilterStore) {}

  execute(request: ToggleCategoryRequest): ToggleCategoryResponse {
    const { categoryId } = request
    
    // Toggle the category selection
    this.categoryFilterStore.toggleCategory(categoryId)
    
    // Save to localStorage
    this.categoryFilterStore.saveToLocalStorage()
    
    // Check if category is now selected
    const isSelected = this.categoryFilterStore.selectedCategories.includes(categoryId)
    
    return {
      isSelected,
      selectedCategories: [...this.categoryFilterStore.selectedCategories]
    }
  }

  isCategorySelected(categoryId: string): boolean {
    return this.categoryFilterStore.selectedCategories.includes(categoryId)
  }

  getSelectedCategories(): string[] {
    return [...this.categoryFilterStore.selectedCategories]
  }
} 