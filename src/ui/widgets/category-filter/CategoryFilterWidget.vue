<template>
  <ToolTip :text="tooltipText" position="right">
    <div class="category-filter-widget">
      <ToggleButton
        icon="🔍"
        :badge-count="activeFilterCount"
        position="center-right"
        panel-position="right"
        :transparent="true"
        @toggle="toggleCategoryFilter"
        @close="closeCategoryFilter"
      >
        <template #panel="{ close }">
          <div>
            <CategoryFilterPanel 
              :has-active-filters="hasActiveFilters"
              @close="close"
              @toggle-category="handleToggleCategory"
              @reset-filters="handleResetFilters"
            />
          </div>
        </template>
      </ToggleButton>
    </div>
  </ToolTip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ToolTip from '@/ui/shared/ToolTip.vue'
import ToggleButton from '@/ui/shared/ToggleButton.vue'
import CategoryFilterPanel from './CategoryFilterPanel.vue'
import { useBubbleStore } from '@/stores/bubble.store'
import { useI18n } from '@/composables'

const bubbleStore = useBubbleStore()
const { t } = useI18n()

// Computed properties
const hasActiveFilters = computed(() => bubbleStore.hasActiveCategoryFilters)
const activeFilterCount = computed(() => bubbleStore.activeCategoryFilterCount)

const tooltipText = computed(() => {
  if (hasActiveFilters.value) {
    return `${t.value('widgets.categoryFilter.filtered')}: ${activeFilterCount.value} ${t.value('widgets.categoryFilter.categories')}`
  }
  return t.value('widgets.categoryFilter.tooltip')
})

// Methods
const toggleCategoryFilter = () => {
  bubbleStore.toggleCategoryFilterPanel()
}

const closeCategoryFilter = () => {
  bubbleStore.closeCategoryFilterPanel()
}

const handleToggleCategory = (categoryId: string) => {
  bubbleStore.toggleCategory(categoryId)
}

const handleResetFilters = () => {
  bubbleStore.resetCategoryFilters()
}
</script>

<style scoped>
.category-filter-widget {
  pointer-events: auto;
  cursor: pointer;
}
</style> 