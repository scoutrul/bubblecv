<template>
  <div class="achievements-panel content-card">
    <div class="panel-header">
      <h3 class="text-lg font-semibold">🏆 Достижения</h3>
      <button @click="$emit('close')" class="close-btn">✕</button>
    </div>
    
    <div class="achievements-grid">
      <div class="achievement-placeholder">
        <span class="text-text-muted">Достижения будут добавлены позже</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  close: []
}>()
</script>

<style scoped>
.achievements-panel {
  @apply absolute bottom-[4rem] right-[1rem] mb-2 w-80 max-h-96 overflow-y-auto;
  z-index: 1500;
  pointer-events: auto;
}

.panel-header {
  @apply flex justify-between items-center mb-4;
}

.close-btn {
  @apply w-6 h-6 flex items-center justify-center rounded hover:bg-background-secondary;
  pointer-events: auto;
  cursor: pointer;
}

.achievement-placeholder {
  @apply text-center py-8;
}
</style> 