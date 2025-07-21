<template>
  <BaseModal
    :is-open="isOpen"
    :allow-escape-close="allowEscapeClose"
    @close="close"
    class-name="level-up-modal-container"
  >
    <!-- Крестик для закрытия -->
    <button
      @click="close"
      class="close-button"
      aria-label="Закрыть"
    >
      ×
    </button>

    <!-- Заголовок с анимацией -->
    <div class="level-up-header">
      <div class="level-icon-large">{{ levelData.icon }}</div>
      <h2 class="level-up-title" v-if="levelData.level > 1">LEVEL UP!</h2>
      <div class="new-level">
        <span class="level-number">Уровень {{ levelData.level }}</span>
      </div>
    </div>

    <!-- Описание -->
    <div class="level-description">
      <p>{{ levelData.description }}</p>
    </div>

    <!-- Разблокированные возможности -->
    <div v-if="unlockedFeatures.length > 0" class="unlocked-features">
      <h3>🔓 Разблокировано:</h3>
      <ul>
        <li v-for="feature in unlockedFeatures" :key="feature">
          {{ feature }}
        </li>
      </ul>
    </div>

    <!-- Разблокированный бонус -->
    <div v-if="unlockedBonus" class="unlocked-bonus">
      <h3>🎁 Новый бонус:</h3>
      <div
        class="bonus-preview"
        @click="openUnlockedBonus"
      >
        <div class="bonus-preview-icon">{{ unlockedBonus.icon }}</div>
        <div class="bonus-preview-content">
          <div class="bonus-preview-title">{{ unlockedBonus.title }}</div>
          <div class="bonus-preview-subtitle">Нажмите для просмотра</div>
        </div>
        <div class="bonus-preview-arrow">→</div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/global/BaseModal.vue'
import { useBonuses } from '@/composables'
import { computed, onMounted } from 'vue'

interface Props {
  isOpen: boolean
  level: number
  title: string
  description: string
  icon: string
  currentXP: number
  xpGained: number
  unlockedFeatures?: string[]
  allowEscapeClose?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  unlockedFeatures: () => []
})

const emit = defineEmits<Emits>()
const { getUnlockedBonusForLevel, unlockBonusForLevel, openBonusModal } = useBonuses()

const levelData = computed(() => ({
  level: props.level,
  title: props.title,
  description: props.description,
  icon: props.icon
}))

const unlockedFeatures = computed(() => props.unlockedFeatures)

const unlockedBonus = computed(() =>
  getUnlockedBonusForLevel(props.level)
)

// Разблокируем бонус при открытии модалки
onMounted(() => {
  if (props.isOpen && props.level) {
    unlockBonusForLevel(props.level)
  }
})

const openUnlockedBonus = () => {
  if (unlockedBonus.value) {
    openBonusModal(unlockedBonus.value)
    emit('close')
  }
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
:deep(.level-up-modal-container) {
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
}

.level-description {
  margin-bottom: 1.5rem;
  text-align: center;
}

.level-description p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.unlocked-features {
  margin-bottom: 1.5rem;
}

.unlocked-features h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.unlocked-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.unlocked-features li {
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.unlocked-features li::before {
  content: '✨';
  color: var(--accent);
}

.unlocked-bonus {
  margin-bottom: 1.5rem;
}

.unlocked-bonus h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.bonus-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.bonus-preview:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-1px);
}

.bonus-preview-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.bonus-preview-content {
  flex: 1;
}

.bonus-preview-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.bonus-preview-subtitle {
  font-size: 0.75rem;
  color: var(--accent);
}

.bonus-preview-arrow {
  color: var(--accent);
  font-weight: bold;
  flex-shrink: 0;
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
.level-up-modal[data-level="2"] .level-up-title {
  background: linear-gradient(to right, #60a5fa, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.level-up-modal[data-level="3"] .level-up-title {
  background: linear-gradient(to right, #4ade80, #22c55e);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.level-up-modal[data-level="4"] .level-up-title {
  background: linear-gradient(to right, #a78bfa, #8b5cf6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.level-up-modal[data-level="5"] .level-up-title {
  background: linear-gradient(to right, #fbbf24, #f97316);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
