<template>
  <BaseModal
    :is-open="isOpen"
    :allow-escape-close="allowEscapeClose"
    @close="$emit('close')"
    class="bubble-modal-container"
  >
    <div class="modal-content-wrapper">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <div
            class="bubble-icon"
            :style="{ backgroundColor: getBubbleColor(bubble) }"
          >
            <span class="bubble-initial">
              {{ bubble?.name?.[0]?.toUpperCase() }}
            </span>
          </div>
          <div>
            <h2 class="bubble-name">{{ bubble?.name }}</h2>
          </div>
        </div>

          <!-- Крестик для закрытия -->
          <button
            @click="$emit('close')"
            class="close-button"
            aria-label="Закрыть"
          >
            ×
          </button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Skill Level -->
        <div class="skill-section">
          <h3 class="section-title">Уровень экспертизы</h3>
          <div class="skill-level">
            <div class="skill-badge" :class="skillLevelClass">
                {{ bubble?.skillLevel ? SKILL_LEVEL_LABELS[bubble.skillLevel] : '' }}
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="description-section">
          <h3 class="section-title">Описание</h3>
          <p class="description-text">
            {{ bubble?.description }}
          </p>
        </div>

        <!-- Insight -->
        <div v-if="bubble?.insight" class="insight-section">
          <h3 class="section-title">Инсайт</h3>
          <p class="insight-text">
            {{ bubble?.insight }}
          </p>
        </div>


        <!-- Timeline -->
        <div class="timeline-section">
            <h3 class="section-title">Год появления</h3>
          <div class="timeline-info">
              <span class="timeline-start">{{ bubble?.year }}</span>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <div class="xp-reward">
          <span class="xp-text">
              + {{ xpReward }} XP
          </span>
        </div>
        <button
          @click="$emit('close')"
          aria-label="Закрыть"
          class="close-text"
        >
          закрыть
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/global/BaseModal.vue'
import { XP_CALCULATOR } from '@/config'
import { SKILL_LEVEL_LABELS } from '@/types/skill-levels'
import type { NormalizedBubble } from '@/types/normalized'
import { getBubbleColor } from '@/utils/bubble'
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  bubble: NormalizedBubble
  allowEscapeClose?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const skillLevelClass = computed(() => {
  if (!props.bubble?.skillLevel) return ''
  return `skill-${props.bubble.skillLevel}`
})

const xpReward = computed(() => {
  if (!props.bubble) return 0

  // Используем централизованную логику для расчета XP
  return XP_CALCULATOR.getBubbleXP(props.bubble.skillLevel)
})


</script>

<style scoped>
:deep(.bubble-modal-container .modal-content) {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 2px solid #3b82f6;
  max-width: 420px;
}

.modal-content-wrapper {
  @apply w-full max-w-[480px];
}

.modal-header {
  @apply flex justify-between items-start p-6 pb-4;
  @apply border-b border-border;
  @apply relative;
}

.header-content {
  @apply flex items-center gap-3;
}

.bubble-initial {
  @apply text-white font-bold text-lg;
}

.bubble-name {
  @apply text-xl font-bold text-text-primary;
}

.close-button {
  @apply absolute top-4 right-4;
  @apply w-8 h-8 rounded-full;
  @apply bg-gray-100 hover:bg-gray-200;
  @apply border border-gray-300 hover:border-gray-400;
  @apply text-gray-600 hover:text-gray-800;
  @apply font-bold text-xl leading-none;
  @apply transition-all duration-200;
  @apply flex items-center justify-center;
  cursor: pointer;
}

.close-button:hover {
  transform: scale(1.05);
}

.close-text {
  @apply text-success font-bold text-lg;
  text-decoration: underline;
}

.close-text:hover {
  @apply text-success-light font-bold text-lg;
  text-underline-offset: 2px;
}

.bubble-icon {
  @apply w-12 h-12 rounded-full;
  @apply flex items-center justify-center;
  @apply shadow-lg;
}

.modal-content {
  @apply p-6 space-y-6;
}

.section-title {
  @apply text-lg font-semibold text-text-primary mb-3;
}

.skill-section {
  @apply space-y-3;
}

.skill-level {
  @apply flex items-center gap-3;
}

.skill-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium;
}

.skill-novice {
  @apply bg-green-100 text-green-800;
}

.skill-intermediate {
  @apply bg-blue-100 text-blue-800;
}

.skill-confident {
  @apply bg-purple-100 text-purple-800;
}

.skill-expert {
  @apply bg-orange-100 text-orange-800;
}

.skill-master {
  @apply bg-red-100 text-red-800;
}

.skill-years {
  @apply text-text-secondary text-sm;
}

.description-text {
  @apply text-text-secondary leading-relaxed;
}

.insight-text {
  @apply text-text-secondary leading-relaxed italic;
}

.timeline-info {
  @apply flex items-center gap-3;
}

.timeline-start {
  @apply text-sm font-medium text-text-primary;
}

.modal-footer {
  @apply flex justify-between items-center;
  @apply p-6 pt-4 border-t border-border;
}

.xp-reward {
  @apply flex items-center gap-2;
}

.xp-text {
  @apply text-success font-bold text-lg;
}
</style>
