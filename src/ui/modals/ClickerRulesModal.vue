<template>
  <BaseModal :isOpen="isOpen" :allowEscapeClose="true" :isClosing="isClosing" @close="onClose">
    <div class="modal-header">
      <h2 class="modal-title">{{ t('clicker.rulesTitle') }}</h2>
    </div>
    <div class="modal-body">
      <p class="mb-4">{{ t('clicker.rulesDescription') }}</p>
      <ul class="list-disc pl-6 space-y-1 text-sm">
        <li>{{ t('clicker.ruleInstantPop') }}</li>
        <li>{{ t('clicker.ruleTimer') }}</li>
        <li>{{ t('clicker.ruleTough') }}</li>
        <li>{{ t('clicker.ruleAbort') }}</li>
      </ul>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" @click="onClose">{{ t('common.cancel') }}</button>
      <button class="btn btn-primary" @click="onStart">{{ t('clicker.startButton') }}</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/ui/shared/BaseModal.vue'
import { useClickerStore } from '@/stores'
import { useI18n } from '@/composables'

interface Props {
  isOpen: boolean
  isClosing?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void }>()

const clicker = useClickerStore()
const { t } = useI18n()

const onClose = () => emit('close')
const onStart = () => {
  // Close current modal then start countdown
  emit('close')
  clicker.startCountdown()
}
</script>

<style scoped>
.modal-header { @apply mb-2; }
.modal-title { @apply text-xl font-semibold; }
.modal-body { @apply text-text-primary; }
.modal-actions { @apply mt-6 flex gap-3 justify-end; }
.btn { @apply px-4 py-2 rounded-lg; }
.btn-primary { @apply bg-primary text-white hover:opacity-90; }
.btn-secondary { @apply bg-background-secondary text-text-primary border border-border hover:opacity-90; }
</style>
