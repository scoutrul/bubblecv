<template>
  <div class="app">
    <GameScene/>
    <ModalManager />
    <LoadingSpinner v-if="isAppLoading" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useApp } from '@/composables/'

import LoadingSpinner from '@/ui/global/LoadingSpinner.vue'
import ModalManager from '@/ui/modals/ModalManager.vue'
import GameScene from './ui/global/GameScene.vue'

const { initialize, isAppLoading } = useApp()

onMounted(async () => {
  try {
    await initialize()
  } catch (e) {
    console.error('Ошибка инициализации:', e)
  }
})
</script>

<style scoped>
.app {
  @apply h-full w-full relative overflow-hidden;
  background: radial-gradient(ellipse at center, #1a1b23 0%, #0a0b0f 100%);
}
</style> 