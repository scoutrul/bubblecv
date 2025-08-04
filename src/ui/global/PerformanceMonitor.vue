<template>
  <div v-if="showPerformancePanel" class="performance-monitor">
    <div class="performance-info">
      <div class="fps-display">
        <span class="fps-label">{{ t('performance.fps') }}</span>
        <span class="fps-value" :class="fpsClass">{{ performanceInfo.fps }}</span>
      </div>
      <div class="performance-level">
        <span class="level-label">{{ t('performance.level') }}</span>
        <span class="level-value" :class="levelClass">{{ performanceLevelText }}</span>
      </div>
      <div class="star-count">
        <span class="stars-label">{{ t('performance.stars') }}</span>
        <span class="stars-value">{{ performanceInfo.starCount }}</span>
      </div>
      <div class="active-nodes" v-if="activeNodes !== undefined">
        <span class="nodes-label">{{ t('performance.nodes') }}</span>
        <span class="nodes-value">{{ activeNodes }}</span>
      </div>
    </div>
    <div class="star-breakdown">
      <div class="star-layer" v-if="starCounts.deepBg > 0">
        <span class="layer-name">{{ t('performance.layers.deepBg') }}</span>
        <span class="layer-count">{{ starCounts.deepBg }}</span>
      </div>
      <div class="star-layer">
        <span class="layer-name">{{ t('performance.layers.center') }}</span>
        <span class="layer-count">{{ starCounts.center }}</span>
      </div>
      <div class="star-layer">
        <span class="layer-name">{{ t('performance.layers.bg') }}</span>
        <span class="layer-count">{{ starCounts.bg }}</span>
      </div>
      <div class="star-layer">
        <span class="layer-name">{{ t('performance.layers.fg') }}</span>
        <span class="layer-count">{{ starCounts.fg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePerformanceStore } from '@/stores/performance.store'
import { useI18n } from '@/composables'

const performanceStore = usePerformanceStore()
const { t } = useI18n()

// Получаем данные из store
const showPerformancePanel = computed(() => performanceStore.showPerformancePanel)
const performanceInfo = computed(() => ({
  fps: performanceStore.fps,
  performanceLevel: performanceStore.performanceLevel,
  starCount: performanceStore.starCount
}))
const starCounts = computed(() => performanceStore.starCounts)
const activeNodes = computed(() => performanceStore.activeNodes)

const fpsClass = computed(() => {
  if (performanceInfo.value.fps >= 55) return 'fps-good'
  if (performanceInfo.value.fps >= 30) return 'fps-warning'
  return 'fps-bad'
})

const levelClass = computed(() => {
  switch (performanceInfo.value.performanceLevel) {
    case 0: return 'level-good'
    case 1: return 'level-warning'
    case 2: return 'level-bad'
    default: return 'level-good'
  }
})

const performanceLevelText = computed(() => {
  switch (performanceInfo.value.performanceLevel) {
    case 0: return t.value('performance.levels.full')
    case 1: return t.value('performance.levels.medium')
    case 2: return t.value('performance.levels.minimal')
    default: return t.value('performance.levels.unknown')
  }
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  z-index: 1000;
  min-width: 200px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.performance-info {
  margin-bottom: 0.75rem;
}

.fps-display, .performance-level, .star-count, .active-nodes {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.fps-value.fps-good {
  color: #4ade80;
}

.fps-value.fps-warning {
  color: #fbbf24;
}

.fps-value.fps-bad {
  color: #f87171;
}

.level-value.level-good {
  color: #4ade80;
}

.level-value.level-warning {
  color: #fbbf24;
}

.level-value.level-bad {
  color: #f87171;
}

.star-breakdown {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 0.75rem;
}

.star-layer {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.8;
}

.layer-name {
  color: #9ca3af;
}

.layer-count {
  color: #d1d5db;
  font-weight: bold;
}
</style> 