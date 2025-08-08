<template>
  <div class="category-filter-panel content-card">
    <div class="panel-header">
      <h3 class="text-lg font-semibold">🔍 {{ t('widgets.categoryFilter.title') }}</h3>
      <button @click="$emit('close')" class="close-btn">✕</button>
    </div>

    <div class="panel-content">
      <!-- Show All button -->
      <div class="show-all-section">
        <button @click="handleResetFilters" class="show-all-button" :class="{ 'active': !hasActiveFilters }">
          <span class="show-all-text">{{ t('widgets.categoryFilter.showAll') }}</span>
          <span class="total-count">({{ totalBubbleCount }})</span>
        </button>
      </div>

      <!-- Categories list -->
      <div class="categories-section">
        <h4 class="categories-title">{{ t('widgets.categoryFilter.categories') }}</h4>
        <div class="categories-list">
          <div v-if="availableCategories.length === 0" class="category-placeholder">
            <span class="text-text-muted">Загрузка категорий...</span>
          </div>
          <div v-else class="space-y-2">
            <CategoryFilterItem v-for="category in availableCategories" :key="category.id" :category="category"
              @toggle="handleToggleCategory" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
import { useI18n } from '@/composables'
import CategoryFilterItem from './CategoryFilterItem.vue'
import { useBubbleStore } from '@/stores/bubble.store'
import { CategoryFilterUseCaseFactory } from '@/usecases/category-filter'
import type { CategoryInfo } from '@/usecases/category-filter/types'

interface Props {
  hasActiveFilters: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'toggle-category', categoryId: string): void
  (e: 'reset-filters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const bubbleStore = useBubbleStore()
const { t } = useI18n()

const availableCategories = ref<CategoryInfo[]>([])

const totalBubbleCount = computed(() => {
  return availableCategories.value.reduce((total, cat) => total + cat.count, 0)
})

// Load categories
const loadCategories = () => {
  if (bubbleStore.bubbles.length > 0) {
    // Create a mock store for the use case factory
    const mockStore = {
      selectedCategories: bubbleStore.selectedCategories,
      setAvailableCategories: (categories: CategoryInfo[]) => {
        availableCategories.value = categories
      }
    }

    const factory = new CategoryFilterUseCaseFactory(mockStore as any)
    const getCategoriesUseCase = factory.createGetCategoriesUseCase(bubbleStore.bubbles)
    getCategoriesUseCase.execute({ bubbles: bubbleStore.bubbles })
  }
}

onMounted(() => {
  loadCategories()
})

watch(() => bubbleStore.bubbles, () => {
  loadCategories()
}, { deep: true })

const handleToggleCategory = (categoryId: string) => {
  emit('toggle-category', categoryId)
}

const handleResetFilters = () => {
  emit('reset-filters')
}
</script>

<style scoped>
.category-filter-panel {
  pointer-events: auto;
}

.panel-header {
  @apply flex justify-between items-center mb-4;
}

.panel-header h3 {
  @apply text-base sm:text-lg;
}

.close-btn {
  @apply w-6 h-6 flex items-center justify-center rounded;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-colors duration-200;
  pointer-events: auto;
  cursor: pointer;
}

.panel-content {
  @apply space-y-4;
}

.show-all-section {
  @apply border-b border-border pb-3;
}

.show-all-button {
  @apply w-full flex items-center justify-between p-3 rounded-lg;
  @apply bg-background-secondary hover:bg-background-card;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-all duration-200;
  @apply border border-transparent hover:border-border;
}

.show-all-button.active {
  @apply bg-primary/20 text-primary border-primary/30;
}

.show-all-text {
  @apply font-medium;
}

.total-count {
  @apply text-sm opacity-70;
}

.categories-section {
  @apply space-y-3;
}

.categories-title {
  @apply text-sm font-medium text-text-secondary;
  @apply uppercase tracking-wide;
}

.categories-list {
  @apply space-y-2 max-h-64 overflow-y-auto;
  padding-right: 0.5rem;
  margin-right: -0.5rem;
}

.category-placeholder {
  @apply text-center py-8;
}

/* Mobile adaptations */
@media (max-width: 640px) {
  .categories-list {
    max-height: calc(100vh - 12rem);
  }
}

@media (max-width: 359px) {
  .categories-list {
    max-height: calc(100vh - 10rem);
  }
}
</style> 