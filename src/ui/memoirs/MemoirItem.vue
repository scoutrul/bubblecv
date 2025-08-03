<template>
  <div 
    class="memoir-item"
    :class="{ 'locked': !memoir.isUnlocked, 'unlocked': memoir.isUnlocked }"
    @click="handleClick"
  >
    <div class="memoir-icon">
      {{ memoir.icon }}
    </div>
    
    <div class="memoir-content">
      <div class="memoir-title">
        {{ memoir.title }}
      </div>
      <div class="memoir-level">
        Уровень {{ memoir.level }}
      </div>
    </div>
    
    <div class="memoir-status">
      <div v-if="memoir.isUnlocked" class="status-unlocked">
        <span v-if="isRead" class="status-read">✅</span>
        <span v-else class="status-unread">☐</span>
      </div>
      <div v-else class="status-locked">
        🔒
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NormalizedMemoir } from '@/types/normalized'

interface Props {
  memoir: NormalizedMemoir
  isRead: boolean
}

interface Emits {
  (e: 'click', memoir: NormalizedMemoir): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClick = () => {
  if (props.memoir.isUnlocked) {
    emit('click', props.memoir)
  }
}
</script>

<style scoped>
.memoir-item {
  @apply flex items-center gap-3 p-3 rounded-lg border transition-all duration-200;
  cursor: pointer;
}

.memoir-item.unlocked {
  @apply border-border hover:border-green-500;
  background: rgba(51, 65, 85, 0.5);
}

.memoir-item.unlocked:hover {
  @apply transform scale-[1.01];
  border-color: rgba(34, 197, 94, 0.5);
}

.memoir-item.locked {
  @apply border-border bg-gray-800 opacity-50;
  cursor: not-allowed;
  filter: grayscale(100%);
}

.memoir-icon {
  @apply flex-shrink-0 w-8 h-8 flex items-center justify-center text-lg;
}

.memoir-content {
  @apply flex-1 min-w-0;
}

.memoir-title {
  @apply font-medium text-text-primary text-sm;
  color: var(--text-primary);
}

.memoir-level {
  @apply text-xs text-text-secondary mt-1;
  color: var(--text-secondary);
}

.memoir-status {
  @apply flex-shrink-0;
}

.status-unlocked {
  @apply text-green-400;
}

.status-read {
  @apply text-green-400;
}

.status-unread {
  @apply text-gray-400;
  font-size: 1.2em;
}

.status-locked {
  @apply text-gray-500;
}

.locked .memoir-title,
.locked .memoir-level {
  @apply text-gray-500;
}

@media (max-width: 640px) {
  .memoir-item {
    @apply p-2 gap-2;
  }
  
  .memoir-icon {
    @apply w-6 h-6 text-base;
  }
  
  .memoir-title {
    @apply text-xs;
  }
  
  .memoir-level {
    @apply text-xs;
  }
}
</style> 