<template>
  <Transition
    name="modal-backdrop"
    appear
    @after-leave="onAfterLeave"
  >
    <div
      v-if="isOpen"
      class="modal-backdrop"
    >
      <Transition
        name="modal-window"
        appear
      >
        <div
          class="modal-window"
          :class="className"
          @click.stop
        >
          <div class="modal-content">
            <slot />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  isOpen: boolean
  className?: string
  allowEscapeClose?: boolean
  isClosing?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen && props.allowEscapeClose) {
    emit('close')
  }
}

const onAfterLeave = () => {
  emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal-backdrop {
  @apply fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm;
}

.modal-window {
  @apply relative cursor-default max-h-[90vh] flex flex-col modal-container bg-background-primary overflow-hidden;
  width: fit-content;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(59, 130, 246, 0.1),
    0 0 50px rgba(59, 130, 246, 0.15);
  border-radius: 1rem;  
}

/* Анимация фона - только прозрачность */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

/* Анимация модального окна - масштабирование */
.modal-window-enter-active,
.modal-window-leave-active {
  transition: all 0.3s ease;
}

.modal-window-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-window-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.modal-container {
  background: var(--background-primary);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border);
}

.close-button {
  transform: scale(1.05);
}

/* Стили для скроллируемой области */
.modal-content {
  @apply flex-1 py-6 mt-4 mx-[-6px] px-[20px];
  @apply overflow-y-auto overflow-x-hidden;
}

.modal-content::-webkit-scrollbar {
  @apply w-3 ;
}

.modal-content::-webkit-scrollbar-track {
  @apply bg-gray-600 rounded-full;
}

.modal-content::-webkit-scrollbar-thumb {
  @apply bg-gray-800 rounded-full;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-700;
}
</style>
