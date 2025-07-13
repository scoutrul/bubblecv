<template>
  <div 
    class="bonus-item"
    :class="{ 'locked': !bonus.isUnlocked, 'unlocked': bonus.isUnlocked }"
    @click="handleClick"
  >
    <div class="bonus-icon">
      {{ bonus.icon }}
    </div>
    
    <div class="bonus-content">
      <div class="bonus-title">
        {{ bonus.title }}
      </div>
      <div class="bonus-level">
        Уровень {{ bonus.level }}
      </div>
    </div>
    
    <div class="bonus-status">
      <div v-if="bonus.isUnlocked" class="status-unlocked">
        ✅
      </div>
      <div v-else class="status-locked">
        🔒
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NormalizedBonus } from '@/types/normalized'

interface Props {
  bonus: NormalizedBonus
}

interface Emits {
  (e: 'click', bonus: NormalizedBonus): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClick = () => {
  if (props.bonus.isUnlocked) {
    emit('click', props.bonus)
  }
}
</script>

<style scoped>
.bonus-item {
  @apply flex items-center gap-3 p-3 rounded-lg border transition-all duration-200;
  cursor: pointer;
}

.bonus-item.unlocked {
  @apply border-border hover:border-primary;
  background: rgba(51, 65, 85, 0.5);
}

.bonus-item.unlocked:hover {
  @apply transform scale-[1.01];
}

.bonus-item.locked {
  @apply border-border bg-gray-800 opacity-50;
  cursor: not-allowed;
  filter: grayscale(100%);
}

.bonus-icon {
  @apply flex-shrink-0 w-8 h-8 flex items-center justify-center text-lg;
}

.bonus-content {
  @apply flex-1 min-w-0;
}

.bonus-title {
  @apply font-medium text-text-primary text-sm;
  color: var(--text-primary, #f1f5f9);
}

.bonus-level {
  @apply text-xs text-text-secondary mt-1;
  color: var(--text-secondary, #64748b);
}

.bonus-status {
  @apply flex-shrink-0;
}

.status-unlocked {
  @apply text-green-400;
}

.status-locked {
  @apply text-gray-500;
}

.locked .bonus-title,
.locked .bonus-level {
  @apply text-gray-500;
}

@media (max-width: 640px) {
  .bonus-item {
    @apply p-2 gap-2;
  }
  
  .bonus-icon {
    @apply w-6 h-6 text-base;
  }
  
  .bonus-title {
    @apply text-xs;
  }
  
  .bonus-level {
    @apply text-xs;
  }
}
</style> 