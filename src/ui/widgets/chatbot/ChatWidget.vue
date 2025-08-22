<template>
  <ToolTip :text="t('chat.widgetTooltip')" position="right">
    <div v-if="!isClickerActive" class="chat-widget">
      <button
        @click="openChatModal"
        class="chat-button"
        :title="t('chat.widgetTitle')"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a 2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
  </ToolTip>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal.store'
import { useI18n } from '@/composables'
import ToolTip from '@/ui/shared/ToolTip.vue'
import { useClickerStore } from '@/stores/clicker.store'
import { computed } from 'vue'

const modalStore = useModalStore()
const { t } = useI18n()
const clickerStore = useClickerStore()
const isClickerActive = computed(() => clickerStore.isActive)

const openChatModal = () => {
  modalStore.enqueueModal({
    type: 'chat',
    data: {},
    priority: 20
  })
}
</script>

<style scoped>
.chat-widget {
  @apply relative;
}

.chat-button {
  @apply w-8 h-8 sm:w-12 sm:h-12 rounded-full;
  @apply flex items-center justify-center;
  @apply text-text-secondary hover:text-text-primary;
  @apply transition-all duration-300;
  @apply hover:scale-110;
  @apply active:scale-95;
  @apply bg-background-secondary hover:bg-background-card;
  @apply border border-border hover:border-primary;
}
</style>
