<template>
  <div class="game-over-modal">
    <!-- Game Over Modal будет добавлен позже -->
    <h2>Игра окончена</h2>
    <p>Вы потеряли все жизни!</p>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  close: []
  restart: []
}>()
</script> 