import { GetCategoriesUseCase } from './GetCategoriesUseCase'
import { ToggleCategoryUseCase } from './ToggleCategoryUseCase'
import { ResetFiltersUseCase } from './ResetFiltersUseCase'
import { ApplyFiltersUseCase } from './ApplyFiltersUseCase'
import { CategoryFilterRepositoryImpl } from './CategoryFilterRepository'
import type { CategoryFilterStore } from './types'
import type { NormalizedBubble } from '@/types/normalized'

export class CategoryFilterUseCaseFactory {
  constructor(private categoryFilterStore: CategoryFilterStore) {}

  createGetCategoriesUseCase(bubbles: NormalizedBubble[]): GetCategoriesUseCase {
    const repository = new CategoryFilterRepositoryImpl()
    // Inject bubbles into repository
    Object.defineProperty(repository, 'getBubbles', {
      value: () => bubbles,
      writable: false
    })
    
    return new GetCategoriesUseCase(repository, this.categoryFilterStore)
  }

  createToggleCategoryUseCase(): ToggleCategoryUseCase {
    return new ToggleCategoryUseCase(this.categoryFilterStore)
  }

  createResetFiltersUseCase(): ResetFiltersUseCase {
    return new ResetFiltersUseCase(this.categoryFilterStore)
  }

  createApplyFiltersUseCase(bubbles: NormalizedBubble[]): ApplyFiltersUseCase {
    const repository = new CategoryFilterRepositoryImpl()
    // Inject bubbles into repository
    Object.defineProperty(repository, 'getBubbles', {
      value: () => bubbles,
      writable: false
    })
    
    return new ApplyFiltersUseCase(repository)
  }
} 