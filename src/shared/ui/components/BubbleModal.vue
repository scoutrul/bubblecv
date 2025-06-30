<template>
  <Teleport to="body">
    <Transition
      name="modal"
      appear
    >
      <div 
        v-if="isOpen" 
        class="modal-overlay"
        @click="handleOverlayClick"
        data-testid="bubble-modal"
      >
        <div 
          class="modal-container"
          @click.stop
        >
          <!-- Header -->
          <div class="modal-header">
            <div class="flex items-center gap-3">
              <div 
                class="bubble-icon"
                :style="{ backgroundColor: getBubbleColor() }"
              >
                <span class="text-white font-bold text-lg">
                  {{ bubble?.name?.[0]?.toUpperCase() }}
                </span>
              </div>
              <div>
                <h2 class="text-xl font-bold text-text-primary">{{ bubble?.name }}</h2>
              </div>
            </div>
            
            <!-- Крестик для закрытия -->
            <button 
              @click="$emit('continue')"
              class="close-button"
              aria-label="Закрыть"
              data-testid="bubble-continue"
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
                <div class="skill-years">
                  {{ getExperienceYears() }} лет опыта
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

            <!-- Projects -->
            <div v-if="bubble?.projects?.length" class="projects-section">
              <h3 class="section-title">Проекты</h3>
              <ul class="projects-list">
                <li 
                  v-for="project in bubble.projects" 
                  :key="project"
                  class="project-item"
                >
                  {{ project }}
                </li>
              </ul>
            </div>

            <!-- Link -->
            <div v-if="bubble?.link" class="link-section">
              <a 
                :href="bubble.link"
                target="_blank"
                rel="noopener noreferrer"
                class="external-link"
              >
                🔗 Посмотреть примеры работы
              </a>
            </div>

            <!-- Timeline -->
            <div class="timeline-section">
              <h3 class="section-title">Временная линия</h3>
              <div class="timeline-info">
                <span class="timeline-start">{{ bubble?.yearStarted }}</span>
                <div class="timeline-line"></div>
                <span class="timeline-end">
                  {{ bubble?.yearEnded || 'настоящее время' }}
                </span>
              </div>
            </div>

            <!-- Easter Egg Special -->
            <div v-if="bubble?.isEasterEgg" class="easter-egg-section">
              <div class="easter-egg-badge">
                🥚 Философский пузырь
              </div>
              <p class="easter-egg-text">
                Этот пузырь содержит особые убеждения о разработке. 
                Взаимодействие с ним поможет работодателю понять ваши ценности!
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <div class="xp-reward">
              <span class="xp-text">
                + {{ xpReward }} XP
              </span>
            </div>
            
            <div class="click-outside-hint">
              <span class="hint-text">Кликните вне окна для продолжения</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Bubble } from '@shared/types'
import { GAME_CONFIG } from '@shared/config/game-config'
import { SKILL_LEVEL_LABELS } from '@shared/constants/skill-levels'

interface Props {
  isOpen: boolean
  bubble: Bubble | null
}

interface Emits {
  (e: 'close'): void
  (e: 'continue'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const getSkillLevelLabel = (level?: string) => {
  const labels = {
    'novice': 'Новичок',
    'intermediate': 'Средний',
    'confident': 'Уверенный',
    'expert': 'Эксперт',
    'master': 'Мастер'
  }
  return labels[level as keyof typeof labels] || level
}

const skillLevelClass = computed(() => {
  if (!props.bubble?.skillLevel) return ''
  return `skill-${props.bubble.skillLevel}`
})

const getExperienceYears = () => {
  if (!props.bubble) return 0
  const currentYear = new Date().getFullYear()
  const endYear = props.bubble.yearEnded || currentYear
  return endYear - props.bubble.yearStarted
}

const xpReward = computed(() => {
  if (!props.bubble) return 0
  if (props.bubble.isEasterEgg) return GAME_CONFIG.xpPerEasterEgg
  return GAME_CONFIG.xpPerExpertiseLevel[props.bubble.skillLevel as keyof typeof GAME_CONFIG.xpPerExpertiseLevel] || 1
})

const getBubbleColor = () => {
  if (!props.bubble) return '#3b82f6'
  if (props.bubble.isEasterEgg) {
    return GAME_CONFIG.philosophyBubble.gradientColors[0]
  }
  
  const expertiseConfig = GAME_CONFIG.expertiseLevels[props.bubble.skillLevel as keyof typeof GAME_CONFIG.expertiseLevels]
  return expertiseConfig?.color || '#3b82f6'
}

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('continue')
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm;
  @apply flex items-center justify-center p-4;
  z-index: 2000;
}

.modal-container {
  @apply bg-background-primary border border-border rounded-xl;
  @apply w-full max-w-lg max-h-[90vh] overflow-y-auto;
  @apply shadow-2xl;
}

/* Vue Transition классы */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.2s ease-in;
}

.modal-enter-from {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.modal-enter-from .modal-container {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.modal-leave-to .modal-container {
  opacity: 0;
  transform: scale(0.95);
}

.modal-header {
  @apply flex justify-between items-start p-6 pb-4;
  @apply border-b border-border;
  @apply relative;
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

.projects-list {
  @apply space-y-2;
}

.project-item {
  @apply flex items-center gap-2 text-text-secondary;
}

.project-item::before {
  content: "▸";
  @apply text-primary;
}

.external-link {
  @apply inline-flex items-center gap-2;
  @apply text-primary hover:text-primary-light;
  @apply transition-colors duration-200;
  @apply underline underline-offset-2;
}

.timeline-info {
  @apply flex items-center gap-3;
}

.timeline-start,
.timeline-end {
  @apply text-sm font-medium text-text-primary;
}

.timeline-line {
  @apply flex-1 h-px bg-border;
}

.easter-egg-section {
  @apply bg-gradient-to-r from-purple-50 to-pink-50;
  @apply border border-purple-200 rounded-lg p-4;
}

.easter-egg-badge {
  @apply text-purple-800 font-medium mb-2;
}

.easter-egg-text {
  @apply text-purple-700 text-sm;
}

.modal-footer {
  @apply flex justify-between items-center;
  @apply p-6 pt-4 border-t border-border;
}

.xp-reward {
  @apply flex items-center gap-2;
}

.xp-text {
  @apply text-primary font-bold text-lg;
}

.click-outside-hint {
  @apply text-text-secondary text-sm;
}

.hint-text {
  @apply text-text-secondary;
}

@keyframes modalEnter {
  from { 
    opacity: 0; 
    backdrop-filter: blur(0px);
  }
  to { 
    opacity: 1; 
    backdrop-filter: blur(4px);
  }
}

@keyframes modalScale {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modalLeave {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style> 