<template>
  <BaseModal
    :is-open="isOpen"
    :allow-escape-close="allowEscapeClose"
    :is-closing="isClosing"
    @close="close"
    :class-name="isProjectTransition ? `level-up-modal-container project-transition` : `level-up-modal-container level-up-modal-${levelData.level}`"
  >
    <!-- Крестик для закрытия (скрываем для project transition) -->
    <button
      v-if="!isProjectTransition"
      @click="close"
      class="close-button"
      :aria-label="t('common.close')"
    >
      ×
    </button>

    <!-- Заголовок с анимацией -->
    <div class="level-up-header">
      <div class="level-icon-large">{{ isProjectTransition ? '🚀' : levelData.icon }}</div>
      <h2 class="level-up-title" v-if="isProjectTransition">🎯 {{ t('modals.levelUp.projectTransition.title') }}</h2>
      <h2 class="level-up-title" v-else-if="levelData.level > 1">{{ t('modals.levelUp.title') }}</h2>
      <div class="new-level">
        <span class="level-number" v-if="isProjectTransition">{{ t('modals.levelUp.projectTransition.subtitle') }}</span>
        <span class="level-number" v-else>{{ t('modals.levelUp.message', { level: levelData.level }) }}</span>
      </div>
    </div>

    <!-- Описание -->
    <div class="level-description" v-if="!isProjectTransition">
      <p>{{ levelData.description }}</p>
    </div>

    <!-- Project Transition Description -->
    <div class="project-transition-description" v-if="isProjectTransition">
      <p class="main-text">
        {{ t('modals.levelUp.projectTransition.congratulations') }}
      </p>
      
      <div class="info-box">
        <h3>{{ t('modals.levelUp.projectTransition.whatChanges') }}</h3>
        <ul>
          <li>{{ t('modals.levelUp.projectTransition.changes.skills') }}</li>
          <li>{{ t('modals.levelUp.projectTransition.changes.timeline') }}</li>
          <li>{{ t('modals.levelUp.projectTransition.changes.checkLevel') }}</li>
        </ul>
      </div>
      
      <p class="challenge-text">
        <strong>{{ t('modals.levelUp.projectTransition.challenge') }}</strong>
      </p>
    </div>

    <!-- Разблокированные элементы -->
    <div class="unlocked-items" v-if="!isProjectTransition">
      <!-- Разблокированный бонус -->
      <div v-if="unlockedBonus" class="unlocked-item">
        <h3>{{ t('modals.levelUp.newBonus') }}</h3>
        <div
          class="item-preview bonus-preview"
          @click="openUnlockedBonus"
        >
          <div class="item-preview-icon">{{ unlockedBonus.icon }}</div>
          <div class="item-preview-content">
            <div class="item-preview-title">{{ unlockedBonus.title }}</div>
            <div class="item-preview-subtitle">{{ t('modals.levelUp.clickToView') }}</div>
          </div>
          <div class="item-preview-arrow">→</div>
        </div>
      </div>

      <!-- Разблокированный мемуар -->
      <div v-if="unlockedMemoir" class="unlocked-item">
        <h3>{{ t('modals.levelUp.newMemoir') }}</h3>
        <div
          class="item-preview memoir-preview"
          @click="openUnlockedMemoir"
        >
          <div class="item-preview-icon">{{ unlockedMemoir.icon }}</div>
          <div class="item-preview-content">
            <div class="item-preview-title">{{ unlockedMemoir.title }}</div>
            <div class="item-preview-subtitle">{{ t('modals.levelUp.clickToRead') }}</div>
          </div>
          <div class="item-preview-arrow">→</div>
        </div>
      </div>
    </div>

    <!-- Project Transition Button -->
    <div class="project-transition-footer" v-if="isProjectTransition">
      <button 
        @click="close" 
        class="continue-button"
        type="button"
      >
        {{ t('modals.levelUp.projectTransition.continueButton') }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/global/BaseModal.vue'
import { useBonuses, useMemoirs } from '@/composables'
import { useI18n } from '@/composables'
import { computed, onMounted } from 'vue'

interface Props {
  isClosing?: boolean
  isOpen: boolean
  level: number
  title: string
  description: string
  icon: string
  currentXP: number
  xpGained: number
  allowEscapeClose?: boolean
  isProjectTransition?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()


const { getUnlockedBonusForLevel, unlockBonusForLevel, openBonusModal } = useBonuses()
const { getUnlockedMemoirForLevel, unlockMemoirForLevel } = useMemoirs()
const { t } = useI18n()

const levelData = computed(() => ({
  level: props.level,
  title: props.title,
  description: props.description,
  icon: props.icon
}))

const unlockedBonus = computed(() =>
  getUnlockedBonusForLevel(props.level)
)

const unlockedMemoir = computed(() =>
  getUnlockedMemoirForLevel(props.level)
)

// Разблокируем бонус и мемуар при открытии модалки
onMounted(() => {
  if (props.isOpen && props.level) {
    unlockBonusForLevel(props.level)
    unlockMemoirForLevel(props.level)
  }
})

const openUnlockedBonus = () => {
  if (unlockedBonus.value) {
    // Сначала закрываем текущую модалку
    emit('close')
    
    // Затем открываем модалку бонуса с небольшой задержкой
    setTimeout(() => {
      if (unlockedBonus.value) {
        openBonusModal(unlockedBonus.value)
      }
    }, 100)
  }
}

const openUnlockedMemoir = () => {
  if (unlockedMemoir.value) {
    // Сначала закрываем текущую модалку
    emit('close')
    
    // Затем открываем модалку мемуара с небольшой задержкой
    setTimeout(() => {
      import('@/composables/useModals').then(({ useModals }) => {
        const { openMemoirModal } = useModals()
        if (unlockedMemoir.value) {
          openMemoirModal(unlockedMemoir.value)
        }
      })
    }, 100)
  }
}

const close = () => {
  emit('close')
}
</script>

<style>
.level-up-modal-container {
  background: var(--background-secondary);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 2rem;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  cursor: default;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  color: var(--text-secondary);
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.level-up-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.level-icon-large {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease-out;
}

.level-up-title {
  font-size: 2rem;
  font-weight: 900;
  color: var(--primary);
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--primary), var(--accent));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: glow 2s ease-in-out infinite alternate;
}

.new-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.level-number {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-primary);
  white-space: nowrap;
}

.level-description {
  margin-bottom: 1.5rem;
  text-align: center;
}

.level-description p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.unlocked-items {
  margin-bottom: 1.5rem;
}

.unlocked-item {
  margin-bottom: 1rem;
}

.unlocked-item h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.item-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.item-preview:hover {
  transform: translateY(-1px);
}

.item-preview-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.item-preview-content {
  flex: 1;
}

.item-preview-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.item-preview-subtitle {
  font-size: 0.75rem;
  color: var(--accent);
}

.item-preview-arrow {
  color: var(--accent);
  font-weight: bold;
  flex-shrink: 0;
}

/* Специфичные стили для бонусов */
.bonus-preview {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.bonus-preview:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.5);
}

/* Специфичные стили для мемуаров */
.memoir-preview {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.memoir-preview:hover {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.5);
}

/* Анимации для элементов внутри модалки */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  from {
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }
  to {
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
  }
}

/* Стили для разных уровней */

/* Уровень 2 - синяя обводка */
.level-up-modal-2 {
  border: 2px solid #3b82f6 !important;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3) !important;
}

/* Уровень 3 - зеленая обводка */
.level-up-modal-3 {
  border: 2px solid #22c55e !important;
  box-shadow: 0 20px 40px rgba(34, 197, 94, 0.3) !important;
}

/* Уровень 4 - фиолетовая обводка */
.level-up-modal-4 {
  border: 2px solid #8b5cf6 !important;
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3) !important;
}

/* Уровень 5 - золотая обводка */
.level-up-modal-5 {
  border: 2px solid #fbbf24 !important;
  box-shadow: 0 20px 40px rgba(251, 191, 36, 0.3) !important;
}

/* Project Transition Styles */

.project-transition {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 25%, #fff8a0 50%, #ffed4e 75%, #ffd700 100%) !important;
  border: 2px solid #d4af37 !important;
  box-shadow: 0 20px 40px rgba(255, 215, 0, 0.3) !important;
}

.level-up-modal-container.project-transition .level-up-title {
  color: #2d1810;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  font-weight: bold;
}

.level-up-modal-container.project-transition .level-number {
  color: #2d1810;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

.project-transition-description {
  margin-bottom: 2rem;
}

.project-transition-description .main-text {
  font-size: 1.1rem;
  color: #2d1810;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-weight: 500;
}

.project-transition-description .info-box {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #d4af37;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  text-align: left;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.project-transition-description .info-box h3 {
  color: #2d1810;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.project-transition-description .info-box ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #2d1810;
}

.project-transition-description .info-box li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
  font-weight: 500;
}

.project-transition-description .challenge-text {
  font-size: 1.1rem;
  color: #2d1810;
  font-weight: bold;
  margin: 1.5rem 0;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

.project-transition-footer {
  margin-top: 2rem;
  text-align: center;
}

.continue-button {
  background: linear-gradient(135deg, #2d1810 0%, #4a2c1a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(45, 24, 16, 0.3);
  min-width: 250px;
}

.continue-button:hover {
  background: linear-gradient(135deg, #4a2c1a 0%, #2d1810 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(45, 24, 16, 0.4);
}

.continue-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(45, 24, 16, 0.3);
}


</style>
