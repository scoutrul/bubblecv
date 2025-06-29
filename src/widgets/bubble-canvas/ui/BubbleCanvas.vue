<template>
  <div class="bubble-canvas-container" ref="containerRef">
    <!-- Canvas холст для отрисовки пузырей -->
    <canvas
      ref="canvasRef"
      class="bubble-canvas"
      @mousemove="handleMouseMove"
      @click="handleClick"
      @mouseleave="handleMouseLeave"
    ></canvas>
    
    <!-- Временная линия -->
    <TimelineSlider 
      :currentYear="currentYear"
      :start-year="startYear"
      :end-year="endYear"
      @update:currentYear="emit('update:currentYear', $event)"
      class="timeline"
    />
    
    <!-- Загрузочный экран -->
    <LoadingSpinner v-if="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useCanvasSimulation } from '../composables/useCanvasSimulation'
import { useBubbleStore } from '../../../entities/bubble/model/bubble-store'
import TimelineSlider from '../../../features/timeline/ui/TimelineSlider.vue'
import LoadingSpinner from '../../../shared/ui/components/LoadingSpinner.vue'

interface Props {
  currentYear: number
  startYear: number
  endYear: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update:currentYear'])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const bubbleStore = useBubbleStore()
const isLoading = ref<boolean>(true)

// Функция для проверки и обновления года
const checkBubblesAndAdvance = () => {
  const visibleBubbles = bubbleStore.getBubblesByYear(props.currentYear)
  const hasUnpoppedBubbles = visibleBubbles.some(bubble => !bubble.isPopped)

  if (!hasUnpoppedBubbles && props.currentYear < props.endYear) {
    console.log('🎯 Все пузыри лопнуты, переключаем на следующий год')
    setTimeout(() => {
      emit('update:currentYear', props.currentYear + 1)
    }, 500)
  }
}

// Инициализация канваса с передачей callback
const { 
  initSimulation, 
  updateBubbles, 
  destroySimulation,
  updateSimulationSize,
  handleMouseMove: simMouseMove,
  handleClick: simClick,
  handleMouseLeave: simMouseLeave,
  isInitialized
} = useCanvasSimulation(canvasRef, checkBubblesAndAdvance)

// Обработчики событий мыши
const handleMouseMove = (event: MouseEvent) => {
  if (!isLoading.value) {
    simMouseMove(event)
  }
}

const handleClick = (event: MouseEvent) => {
  if (!isLoading.value) {
    simClick(event)
  }
}

const handleMouseLeave = () => {
  if (!isLoading.value) {
    simMouseLeave()
  }
}

// Следим за изменением года
watch(() => props.currentYear, (newYear: number) => {
  if (!isLoading.value) {
    const filteredBubbles = bubbleStore.getBubblesByYear(newYear)
    updateBubbles(filteredBubbles)
    
    // Если нет пузырей и не достигнут конец временной шкалы
    if (filteredBubbles.length === 0 && newYear < props.endYear) {
      console.log('🔄 Нет пузырей в текущем году, переключаем на следующий')
      setTimeout(() => {
        emit('update:currentYear', newYear + 1)
      }, 500)
    }
  }
})

// Инициализация и очистка
onMounted(async () => {
  console.log('🎨 Инициализация BubbleCanvas...')
  isLoading.value = true
  
  try {
    // Ждем загрузки пузырей
    if (bubbleStore.bubbles.length === 0) {
      console.log('📦 Загружаем пузыри...')
      await bubbleStore.loadBubbles()
      console.log('✅ Пузыри загружены:', bubbleStore.bubbles.length)
    }

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          console.log('📏 Обновляем размеры канваса:', width, 'x', height)
          updateSimulationSize(width, height)
          if (!isInitialized.value) {
            console.log('🎮 Инициализируем симуляцию...')
            initSimulation(width, height)
            const initialBubbles = bubbleStore.getBubblesByYear(props.currentYear)
            updateBubbles(initialBubbles)
            console.log('✅ Симуляция инициализирована с', initialBubbles.length, 'пузырями')
            isLoading.value = false
          }
        }
      }
    })

    if (containerRef.value) {
      resizeObserver.observe(containerRef.value)
    }

    onUnmounted(() => {
      resizeObserver.disconnect()
      destroySimulation()
    })
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error)
    isLoading.value = false
  }
})
</script>

<style scoped>
.bubble-canvas-container {
  @apply w-full h-full relative;
}

.bubble-canvas {
  @apply absolute inset-0;
  background: transparent;
  cursor: default;
  display: block;
  /* Убираем любые возможные искажения */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.timeline {
  @apply absolute bottom-8 left-1/2 transform -translate-x-1/2;
  @apply bg-background-glass backdrop-blur-md rounded-lg p-4;
  @apply border border-border;
  width: min(400px, 90vw);
}
</style>