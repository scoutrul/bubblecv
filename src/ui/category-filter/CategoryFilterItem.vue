<template>
  <div class="category-item">
    <label class="category-checkbox">
      <input
        type="checkbox"
        :checked="isSelected"
        @change="handleToggle"
        class="checkbox-input"
        
      />
      <span class="checkbox-custom"></span>
      <span class="category-name">{{ category.name }}</span>
      <span class="category-count">{{ formatBubbleCount(category.count) }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables'
import type { CategoryInfo } from '@/usecases/category-filter/types'
import { useBubbleStore } from '@/stores/bubble.store'
import { computed } from 'vue'

interface Props {
  category: CategoryInfo
}

interface Emits {
  (e: 'toggle', categoryId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const bubbleStore = useBubbleStore()
const { t } = useI18n()

const isSelected = computed(() => {
  return bubbleStore.selectedCategories.includes(props.category.id)
})

const handleToggle = () => {
  // toggle
  emit('toggle', props.category.id)
}

const formatBubbleCount = (count: number): string => {
  // Use Russian pluralization rules
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return t.value('widgets.categoryFilter.bubbleCountMany', { count })
  }
  
  if (lastDigit === 1) {
    return t.value('widgets.categoryFilter.bubbleCountOne', { count })
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return t.value('widgets.categoryFilter.bubbleCountFew', { count })
  }
  
  return t.value('widgets.categoryFilter.bubbleCount', { count })
}
</script>

<style scoped>
.category-item {
  @apply relative;
}

.category-checkbox {
  @apply flex items-center gap-3 p-2 rounded-lg;
  @apply hover:bg-background-secondary;
  @apply transition-colors duration-200;
  @apply cursor-pointer;
}

.checkbox-input {
  @apply sr-only;
}

.checkbox-custom {
  @apply w-4 h-4 rounded border border-border;
  @apply flex items-center justify-center;
  @apply transition-all duration-200;
  @apply relative;
}

.checkbox-input:checked + .checkbox-custom {
  @apply bg-primary border-primary;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  @apply text-white text-xs font-bold;
}

.category-name {
  @apply flex-1 text-sm font-medium;
  @apply text-text-primary;
}

.category-count {
  @apply text-xs text-text-secondary;
  @apply bg-background-card px-2 py-1 rounded;
}
</style> 