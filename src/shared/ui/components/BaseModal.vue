<template>
  <Transition
    name="modal"
    appear
  >
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
      @click.self="handleClose"
      :data-testid="testId"
    >
      <div 
        class="relative cursor-default max-w-[90%] w-[480px] max-h-[90vh] flex flex-col modal-container bg-background-primary"
        @click.stop
      >
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  testId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* Анимации */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.modal-container {
  background: var(--background-primary, #1e293b);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border, #334155);
}
</style> 