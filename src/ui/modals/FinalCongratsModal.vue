<template>
  <BaseModal :is-open="isOpen" :allow-escape-close="false" :is-closing="isClosing" @close="close"
    class-name="final-modal-container">
    <div ref="rootEl" class="root">
      <div class="confetti">🎉</div>

      <header class="header">
        <h2 class="title shine">{{ t('final.title') }}</h2>
        <p class="subtitle">{{ t('final.subtitle') }}</p>
      </header>

      <section class="stats">
        <div class="stat">
          <span class="icon">🎯</span>
          <div class="content">
            <div class="label">{{ t('final.stats.total') }}</div>
            <div class="value">{{ animated.total }}</div>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat small"><span class="icon">✨</span>
            <div class="content">
              <div class="label">{{ t('final.stats.byType.normal') }}</div>
              <div class="value">{{ animated.normal }}</div>
            </div>
          </div>
          <div class="stat small"><span class="icon">🛡️</span>
            <div class="content">
              <div class="label">{{ t('final.stats.byType.tough') }}</div>
              <div class="value">{{ animated.tough }}</div>
            </div>
          </div>
          <div class="stat small"><span class="icon">👁️</span>
            <div class="content">
              <div class="label">{{ t('final.stats.byType.hidden') }}</div>
              <div class="value">{{ animated.hidden }}</div>
            </div>
          </div>
          <div class="stat small"><span class="icon">💭</span>
            <div class="content">
              <div class="label">{{ t('final.stats.byType.philosophy') }}</div>
              <div class="value">{{ animated.philosophy }}</div>
            </div>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat small"><span class="icon">⭐</span>
            <div class="content">
              <div class="label">{{ t('final.stats.totalXP') }}</div>
              <div class="value">{{ animated.totalXP }}</div>
            </div>
          </div>
          <div class="stat small"><span class="icon">🎁</span>
            <div class="content">
              <div class="label">{{ t('final.stats.bonuses') }}</div>
              <div class="value">{{ animated.bonuses }}</div>
            </div>
          </div>
          <div class="stat small"><span class="icon">🏆</span>
            <div class="content">
              <div class="label">{{ t('final.stats.achievements') }}</div>
              <div class="value">{{ animated.achievements }}</div>
            </div>
          </div>
          <div class="stat small"><span class="icon">📜</span>
            <div class="content">
              <div class="label">{{ t('final.stats.memoirs') }}</div>
              <div class="value">{{ animated.memoirs }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="lists">
        <div class="list-block">
          <h4>🎁 {{ t('bonuses.title') }}</h4>
          <ul class="list">
            <li v-for="b in allBonusesList" :key="b.id">
              <button class="item-preview bonus-preview" @click="openBonusDirect(b)">
                <div class="item-preview-icon">{{ b.icon }}</div>
                <div class="item-preview-content">
                  <div class="item-preview-title">{{ b.title }}</div>
                  <div class="item-preview-subtitle">{{ t('modals.levelUp.clickToView') }}</div>
                </div>
                <div class="item-preview-arrow">→</div>
              </button>
            </li>
          </ul>
        </div>
        <div class="list-block">
          <h4>📜 {{ t('memoirs.title') }}</h4>
          <ul class="list">
            <li v-for="m in allMemoirsList" :key="m.id">
              <button class="item-preview memoir-preview" @click="openMemoirDirect(m)">
                <div class="item-preview-icon">{{ m.icon }}</div>
                <div class="item-preview-content">
                  <div class="item-preview-title">{{ m.title }}</div>
                  <div class="item-preview-subtitle">{{ t('modals.levelUp.clickToRead') }}</div>
                </div>
                <div class="item-preview-arrow">→</div>
              </button>
            </li>
          </ul>
        </div>
      </section>

      <section class="ctas">
        <button class="btn primary" @click="playClicker"><span>🕹️</span>{{ t('final.cta.playClicker') }}</button>
      </section>

      <footer class="credits">
        <p>{{ t('final.footer') }}</p>
      </footer>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/shared/BaseModal.vue'
import { useI18n } from '@/composables'
import { useClickerStore } from '@/stores/clicker.store'
import { useModalStore } from '@/stores/modal.store'
import { useBonusStore } from '@/stores/bonus.store'
import { useMemoirStore } from '@/stores/memoir.store'
import { useBonuses } from '@/composables'
import type { FinalCongratsData } from '@/types/modals'
import type { NormalizedBonus, NormalizedMemoir } from '@/types/normalized'
import { onMounted, reactive, ref, computed, watch } from 'vue'
import { createShakeAnimation } from '@/utils/animations'

interface Props {
  isOpen: boolean
  isClosing?: boolean
  data: FinalCongratsData | null
}

interface Emits { (e: 'close'): void }

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const modalStore = useModalStore()
const clicker = useClickerStore()
const bonusStore = useBonusStore()
const memoirStore = useMemoirStore()
const { openBonusModal } = useBonuses()

const rootEl = ref<HTMLElement | null>(null)

const unlockedBonusesList = computed(() => bonusStore.unlockedBonuses)
const unlockedMemoirsList = computed(() => memoirStore.unlockedMemoirs)

// Полные списки для финала (после тотального unlock)
const allBonusesList = computed(() => bonusStore.bonuses)
const allMemoirsList = computed(() => memoirStore.memoirs)

// Animated counters
const animated = reactive({
  total: 0,
  normal: 0,
  tough: 0,
  hidden: 0,
  philosophy: 0,
  totalXP: 0,
  bonuses: 0,
  achievements: 0,
  memoirs: 0
})

function animateTo(key: keyof typeof animated, end: number, duration = 2400) {
  const start = 0
  const t0 = performance.now()
  const step = (ts: number) => {
    const p = Math.min(1, (ts - t0) / duration)
    // easeOutCubic
    const val = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)))
    ;(animated as Record<string, number>)[key as string] = val
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function resetAnimated() {
  animated.total = 0
  animated.normal = 0
  animated.tough = 0
  animated.hidden = 0
  animated.philosophy = 0
  animated.totalXP = 0
  animated.bonuses = 0
  animated.achievements = 0
  animated.memoirs = 0
}

function runCounters() {
  if (!props.data) return
  resetAnimated()
  animateTo('total', props.data.totalBubbles)
  animateTo('normal', props.data.byType.normal)
  animateTo('tough', props.data.byType.tough)
  animateTo('hidden', props.data.byType.hidden)
  animateTo('philosophy', props.data.byType.philosophy)
  animateTo('totalXP', props.data.totalXP)
  animateTo('bonuses', props.data.bonusesUnlocked)
  animateTo('achievements', props.data.achievementsUnlocked)
  animateTo('memoirs', props.data.memoirsUnlocked)
}

onMounted(() => {
  // Shake when appears
  if (rootEl.value) createShakeAnimation(rootEl.value)
  if (props.isOpen && props.data) runCounters()
})

watch(() => props.isOpen, (open) => {
  if (open && props.data) runCounters()
})

watch(() => props.data, (val) => {
  if (props.isOpen && val) runCounters()
})

const close = () => emit('close')

const playClicker = () => {
  modalStore.closeCurrentModal()
  clicker.openRules()
}

// Open specific bonus/memoir directly with LevelUp-style behavior
const openBonusDirect = async (b: NormalizedBonus) => {
  // закрываем текущую модалку и открываем модалку бонуса
  modalStore.closeCurrentModal()
  setTimeout(async () => {
    await openBonusModal(b)
  }, 100)
}

const openMemoirDirect = async (m: NormalizedMemoir) => {
  modalStore.closeCurrentModal()
  setTimeout(async () => {
    const { useModals } = await import('@/composables/useModals')
    const { openMemoirModal } = useModals()
    openMemoirModal(m)
  }, 100)
}
</script>

<style scoped>
:deep(.final-modal-container) {
  background: radial-gradient(120% 120% at 0% 0%, #f59e0b22 0%, #111827 50%), linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  border: 2px solid #fbbf24;
  width: max-content;
  padding: 2rem;
  color: #fff7ed;
}

.root {
  @apply relative
}

.header {
  @apply text-center mb-4
}

.title {
  @apply font-black text-2xl;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35)
}

/* Shine effect similar to LevelUp title */
.title.shine {
  background: linear-gradient(to right, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: glow 2s ease-in-out infinite alternate;
}

.subtitle {
  @apply text-yellow-200
}

.stats {
  @apply my-4 mb-6
}

.stat {
  @apply flex items-center gap-3 rounded-xl mb-2 px-3 py-2;
  background: rgba(0, 0, 0, .15);
  border: 1px solid rgba(255, 255, 255, .15)
}

.stat .icon {
  @apply text-xl
}

.stat .label {
  @apply text-yellow-100 text-sm
}

.stat .value {
  @apply font-extrabold
}

.stats-grid {
  @apply grid grid-cols-2 gap-2 mt-2
}

.stat.small {
  @apply p-2
}

.lists {
  @apply grid grid-cols-2 gap-4 my-4
}

.list {
  @apply list-none m-0 p-0 grid gap-2
}

/* LevelUp-like preview buttons */
.item-preview {
  @apply flex items-center gap-3 p-3 rounded-md cursor-pointer w-full text-left border-0;
}
.item-preview:hover {
  transform: translateY(-1px);
}
.item-preview-icon {
  @apply text-xl shrink-0;
}
.item-preview-content {
  @apply flex-1;
}
.item-preview-title {
  @apply font-semibold;
}
.item-preview-subtitle {
  @apply text-xs text-amber-200;
}
.item-preview-arrow {
  @apply font-bold text-amber-200 shrink-0;
}

/* Specific styles */
.bonus-preview {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
}
.bonus-preview:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.5);
}

.memoir-preview {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}
.memoir-preview:hover {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.5);
}

.ctas {
  @apply flex gap-2 justify-center my-4
}

.btn {
  @apply inline-flex items-center gap-2 py-3 px-4 bg-gray-800 text-white border-0 rounded-md cursor-pointer
}

.btn.primary {
  @apply bg-amber-500 text-gray-900 font-extrabold
}

.credits {
  @apply text-center text-yellow-200 opacity-90 text-sm mt-3
}

.confetti {
  @apply absolute -top-3 -left-3 text-2xl
}

/* Glow keyframes reused */
@keyframes glow {
  from {
    text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
  }
  to {
    text-shadow: 0 0 20px rgba(251, 191, 36, 0.8), 0 0 30px rgba(251, 191, 36, 0.6);
  }
}
</style>
