<template>
  <div class="timeline-slider" ref="timelineRef">
    <div class="timeline-content" :class="{ 'timeline-shake': isShaking }">
    <div class="timeline-header">
      <h3 class="text-lg font-semibold">Путешествие во времени</h3>
      
      <!-- Компактные кнопки навигации -->
      <div class="navigation-compact">
        <button 
          @click="goToPreviousYear" 
          :disabled="currentYear <= startYear"
          class="nav-button-compact"
          title="Предыдущий год"
        >
          <svg class="nav-icon-compact" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div class="year-display">
          <TransitionGroup name="slide" tag="div" class="year-wrapper">
            <span :key="currentYear" class="year-compact">{{ currentYear }}</span>
          </TransitionGroup>
        </div>
        
        <button 
          @click="goToNextYear" 
          :disabled="currentYear >= endYear"
          class="nav-button-compact"
          title="Следующий год"
        >
          <svg class="nav-icon-compact" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="slider-container">
      <div class="slider-with-labels">
        <span class="year-label-side">{{ startYear }}</span>
        
        <input
          :value="currentYear"
          @input="handleYearChange"
          type="range"
          :min="startYear"
          :max="endYear"
          class="year-slider"
        />
        
        <span class="year-label-side">{{ endYear }}</span>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, computed, watchEffect, nextTick } from 'vue'
import { useBubbleStore } from '@/app/stores/bubble.store'
import { useSessionStore } from '@/app/stores/session.store'
import { gsap } from 'gsap'

interface Props {
  currentYear: number
  startYear: number
  endYear: number
}

interface Emits {
  (e: 'update:currentYear', year: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const bubbleStore = useBubbleStore()
const sessionStore = useSessionStore()

// Ref для анимации shake эффекта
const timelineRef = ref<HTMLElement | null>(null)
const isShaking = ref(false)
const isAutoSwitching = ref(false) // Флаг для предотвращения повторных переключений

const handleYearChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newYear = parseInt(target.value)
  
  // Анимируем смену года
  requestAnimationFrame(() => {
    emit('update:currentYear', newYear)
  })
}

const goToPreviousYear = () => {
  if (props.currentYear > props.startYear) {
    requestAnimationFrame(() => {
      emit('update:currentYear', props.currentYear - 1)
    })
  }
}

const goToNextYear = () => {
  if (props.currentYear < props.endYear) {
    // Добавляем shake эффект
    triggerShakeEffect()
    
    requestAnimationFrame(() => {
      emit('update:currentYear', props.currentYear + 1)
    })
  }
}

// Функция для shake эффекта
const triggerShakeEffect = () => {
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 600) // Длительность shake анимации
}

// 🚀 GSAP альтернатива для анимации shake (более мощная)
const triggerGsapShakeEffect = () => {
  if (timelineRef.value) {
    gsap.to(timelineRef.value, {
      x: "+=2",
      y: "+=1", 
      duration: 0.1,
      repeat: 5,
      yoyo: true,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(timelineRef.value, { x: 0, y: 0 })
      }
    })
  }
}

// 🎨 GSAP анимация для смены года (более крутая чем CSS)
const animateYearChangeWithGsap = (yearElement: HTMLElement) => {
  // Создаем timeline для сложной анимации
  const tl = gsap.timeline()
  
  // Начальное состояние
  gsap.set(yearElement, {
    y: 25,
    scale: 0.8,
    opacity: 0,
    color: "#667eea",
    textShadow: "0 0 20px rgba(102, 126, 234, 0.5)"
  })
  
  // Анимация появления с эффектами
  tl.to(yearElement, {
    y: 0,
    scale: 1.15,
    opacity: 1,
    duration: 0.3,
    ease: "back.out(1.7)"
  })
  .to(yearElement, {
    scale: 0.95,
    duration: 0.15,
    ease: "power2.out"
  })
  .to(yearElement, {
    scale: 1,
    duration: 0.15,
    ease: "power2.out"
  })
  // Плавный переход цвета
  .to(yearElement, {
    color: "#764ba2",
    textShadow: "0 0 12px rgba(118, 75, 162, 0.3)",
    duration: 0.2
  }, "-=0.3")
  .to(yearElement, {
    color: "#8b9dc3",
    textShadow: "0 0 8px rgba(102, 126, 234, 0.2)",
    duration: 0.2
  })
  .to(yearElement, {
    color: "#6b7280",
    textShadow: "none",
    duration: 0.3,
    ease: "power2.out"
  })
  
  return tl
}

// Computed для отслеживания завершения всех доступных пузырей до текущего года
const isCurrentYearCompleted = computed(() => {
  // Используем накопительный метод - все пузыри до текущего года
  const availableBubbles = bubbleStore.getBubblesUpToYear(props.currentYear, sessionStore.visitedBubbles)
  
  if (availableBubbles.length === 0) {
    return true // Если нет доступных пузырей, считаем год завершённым
  }
  
  // Проверяем, все ли доступные пузыри лопнуты
  const hasUnpoppedBubbles = availableBubbles.some(bubble => !bubble.isPopped)
  const isCompleted = !hasUnpoppedBubbles
  
  return isCompleted
})

// Debounce функция для предотвращения множественных срабатываний
let autoSwitchTimeout: number | null = null

const performAutoSwitch = async () => {
  if (isAutoSwitching.value || props.currentYear >= props.endYear) {
    return
  }
  
  isAutoSwitching.value = true
  
  // Ждём следующий tick для убеждения что все updates завершены
  await nextTick()
  
  // Добавляем задержку для плавности + shake эффект
  setTimeout(() => {
    triggerShakeEffect()
    // 🚀 Для использования GSAP замените на: triggerGsapShakeEffect()
    
    // Дополнительная задержка для самого переключения
    setTimeout(() => {
      if (props.currentYear < props.endYear) {
        // Простой переход на следующий год - логика поиска будет в BubbleCanvas
        emit('update:currentYear', props.currentYear + 1)
        
        // Сбрасываем флаг автопереключения после завершения
        setTimeout(() => {
          isAutoSwitching.value = false
        }, 500)
      } else {
        isAutoSwitching.value = false
      }
    }, 300)
  }, 800)
}

// Используем watchEffect для лучшего отслеживания изменений
watchEffect(() => {
  // Очищаем предыдущий timeout
  if (autoSwitchTimeout) {
    clearTimeout(autoSwitchTimeout)
  }
  
  // Проверяем завершение года с debounce
  if (isCurrentYearCompleted.value && props.currentYear < props.endYear && !isAutoSwitching.value) {
    autoSwitchTimeout = window.setTimeout(() => {
      // Повторная проверка после задержки для уверенности
      if (isCurrentYearCompleted.value && !isAutoSwitching.value) {
        performAutoSwitch()
      }
    }, 100) // Небольшая задержка для debounce
  }
})

// Сброс флага автопереключения при смене года вручную
watch(() => props.currentYear, () => {
  if (autoSwitchTimeout) {
    clearTimeout(autoSwitchTimeout)
    autoSwitchTimeout = null
  }
  // Небольшая задержка перед сбросом флага
  setTimeout(() => {
    isAutoSwitching.value = false
  }, 200)
})
</script>

<style scoped>
.timeline-slider {
  @apply w-full;
}

.timeline-content {
  @apply w-full transition-all duration-300;
}

/* Shake анимация для панели timeline - дрожание на месте */
.timeline-shake {
  animation: timeline-shake 0.6s ease-in-out;
}

@keyframes timeline-shake {
  0%, 100% { transform: translate(0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate(-1px, -1px); }
  20%, 40%, 60%, 80% { transform: translate(1px, 1px); }
}

.timeline-header {
  @apply flex justify-between items-center mb-4;
}

.navigation-compact {
  @apply flex items-center gap-1;
}

.nav-button-compact {
  @apply w-6 h-6 flex items-center justify-center rounded 
         bg-background-secondary hover:bg-background-card 
         disabled:opacity-30 disabled:cursor-not-allowed
         transition-all duration-150 hover:scale-105;
}

.nav-button-compact:hover:not(:disabled) {
  @apply bg-primary text-white;
}

.nav-icon-compact {
  @apply w-3 h-3;
}

.year-display {
  @apply relative w-[4rem] h-[1.5rem] overflow-hidden;
}

.year-wrapper {
  @apply absolute inset-0 flex items-center justify-center;
}

.year-compact {
  @apply text-sm font-medium px-2 text-center absolute;
  color: #6b7280; /* text-text-secondary */
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Улучшенные анимации для TransitionGroup с градиентным эффектом */
.slide-move,
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(25px) scale(0.8);
  color: #667eea;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.slide-enter-active {
  color: #667eea;
  text-shadow: 0 0 15px rgba(102, 126, 234, 0.4);
  animation: gradient-fade 0.8s ease-out forwards, year-pulse 0.6s ease-out;
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-25px) scale(1.2);
  color: #9ca3af; /* более блеклый цвет при исчезновении */
}

.slide-leave-active {
  position: absolute;
}

/* Анимация перехода цвета от яркого к обычному */
@keyframes gradient-fade {
  0% {
    color: #667eea;
    text-shadow: 0 0 15px rgba(102, 126, 234, 0.4);
  }
  25% {
    color: #764ba2;
    text-shadow: 0 0 12px rgba(118, 75, 162, 0.3);
  }
  50% {
    color: #8b9dc3;
    text-shadow: 0 0 8px rgba(102, 126, 234, 0.2);
  }
  75% {
    color: #9ca3af;
    text-shadow: 0 0 4px rgba(102, 126, 234, 0.1);
  }
  100% {
    color: #6b7280;
    text-shadow: none;
  }
}

/* Анимация пульсации для нового года */
@keyframes year-pulse {
  0% {
    transform: translateY(25px) scale(0.8);
  }
  30% {
    transform: translateY(0) scale(1.15);
  }
  60% {
    transform: translateY(0) scale(0.95);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

.slider-container {
  @apply space-y-2;
}

.slider-with-labels {
  @apply flex items-center gap-3;
}

.year-label-side {
  @apply text-xs text-text-muted font-medium min-w-[2.5rem] text-center;
}

.year-slider {
  @apply flex-1 h-2 bg-background-secondary rounded-lg appearance-none cursor-pointer;
}

.year-slider::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-primary rounded-full cursor-pointer;
}
</style> 