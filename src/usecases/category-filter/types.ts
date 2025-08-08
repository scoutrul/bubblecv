import type { NormalizedBubble } from '@/types/normalized'

export interface CategoryInfo {
  id: string
  name: string
  count: number
  isSelected: boolean
}

export interface CategoryFilterRepository {
  getBubbles(): NormalizedBubble[]
  getCategories(): CategoryInfo[]
  applyFilters(bubbles: NormalizedBubble[], selectedCategories: string[]): NormalizedBubble[]
}

export interface CategoryFilterStore {
  selectedCategories: string[]
  isPanelOpen: boolean
  availableCategories: CategoryInfo[]
  hasActiveFilters: boolean
  activeFilterCount: number
  selectedCategoriesInfo: CategoryInfo[]
  setSelectedCategories(categories: string[]): void
  toggleCategory(categoryId: string): void
  resetFilters(): void
  togglePanel(): void
  closePanel(): void
  setAvailableCategories(categories: CategoryInfo[]): void
  saveToLocalStorage(): void
  loadFromLocalStorage(): void
}

export interface GetCategoriesRequest {
  bubbles: NormalizedBubble[]
}

export interface GetCategoriesResponse {
  categories: CategoryInfo[]
}

export interface ToggleCategoryRequest {
  categoryId: string
}

export interface ToggleCategoryResponse {
  isSelected: boolean
  selectedCategories: string[]
}

export interface ResetFiltersResponse {
  selectedCategories: string[]
}

export interface ApplyFiltersRequest {
  bubbles: NormalizedBubble[]
  selectedCategories: string[]
}

export interface ApplyFiltersResponse {
  filteredBubbles: NormalizedBubble[]
} 