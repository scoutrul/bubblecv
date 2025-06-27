<template>
  <div class="level-up-modal">
    <!-- Level Up Modal будет добавлен позже -->
    <h2>Level Up! Уровень {{ level }}</h2>
  </div>
</template>

<script setup lang="ts">
interface Props {
  level: number
}

defineProps<Props>()
defineEmits<{
  close: []
}>()
</script> 