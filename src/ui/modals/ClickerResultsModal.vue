<template>
  <BaseModal :isOpen="isOpen" :allowEscapeClose="true" :isClosing="isClosing" @close="onClose">
    <div class="modal-header">
      <h2 class="modal-title">{{ t('clicker.resultsTitle') }}</h2>
    </div>
    <div class="modal-body">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="label">{{ t('clicker.statsClicked') }}</div>
        <div class="value">{{ data?.clicked ?? 0 }}/{{ data?.total ?? 0 }}</div>
        <div class="label">{{ t('clicker.statsScore') }}</div>
        <div class="value">{{ data?.score ?? 0 }}</div>
        <div class="label">{{ t('clicker.statsBonus') }}</div>
        <div class="value">+{{ data?.bonus ?? 0 }}</div>
        <div class="label">{{ t('clicker.statsTotal') }}</div>
        <div class="value font-semibold">{{ data?.totalScore ?? 0 }}</div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn" @click="onExit">{{ t('clicker.exitButton') }}</button>
      <button class="btn btn-primary" @click="onRestart">{{ t('clicker.againButton') }}</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/shared/BaseModal.vue'
import { useClickerStore } from '@/stores'
import { useI18n, useSession } from '@/composables'

interface Props {
  isOpen: boolean
  isClosing?: boolean
  data: { score: number; clicked: number; total: number; timeLeftMs: number; bonus: number; totalScore: number } | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void }>()

const clicker = useClickerStore()
const { t } = useI18n()
const { gainXP } = useSession()

const onClose = async () => {
  emit('close')
  await gainXP(50)
}
const onRestart = async () => {
  emit('close')
  await gainXP(50)
  clicker.startCountdown()
}

const onExit = async () => {
  emit('close')
  await gainXP(50)
  clicker.resetState()
}
</script>

<style scoped>
.modal-header { @apply mb-2; }
.modal-title { @apply text-xl font-semibold; }
.modal-body { @apply text-text-primary mb-4; }
.modal-actions { @apply mt-4 flex gap-3 justify-end; }
.btn { @apply px-4 py-2 rounded-lg; }
.btn-primary { @apply bg-primary text-white hover:opacity-90; }
.label { @apply text-text-secondary; }
.value { @apply text-text-primary text-right; }
</style>
