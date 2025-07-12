<template>
  <div class="timeline-slider" ref="timelineRef" v-if="currentYear && !bubbleStore.isLoading">
    <div class="timeline-content">
      <div class="timeline-header">
        <h3 class="text-text-primary whitespace-nowrap">Путешествие во времени</h3>
        
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
            <div class="year-wrapper">
              <span class="year-compact">{{ currentYear }}</span>
            </div>
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
import { useBubbleStore } from '@/stores/bubble.store'
import { useSessionStore } from '@/stores/session.store'
import { createShakeAnimation, createYearChangeAnimation } from '@/utils/animations'

import { getBubblesUpToYear } from '@/utils/nodes'


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
const isAutoSwitching = ref(false) // Флаг для предотвращения повторных переключений



const handleYearChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newYear = parseInt(target.value)
  
  // Устанавливаем флаг ручного изменения года
  isAutoSwitching.value = true
  
  // Анимируем смену года
  requestAnimationFrame(() => {
    emit('update:currentYear', newYear)
    
    // Сбрасываем флаг через небольшую задержку
    setTimeout(() => {
      isAutoSwitching.value = false
    }, 1000)
  })
}

const goToPreviousYear = () => {
  if (props.currentYear > props.startYear) {
    // Устанавливаем флаг ручного изменения года
    isAutoSwitching.value = true
    
    requestAnimationFrame(() => {
      emit('update:currentYear', props.currentYear - 1)
      
      // Сбрасываем флаг через небольшую задержку
      setTimeout(() => {
        isAutoSwitching.value = false
      }, 1000)
    })
  }
}

const goToNextYear = () => {
  if (props.currentYear < props.endYear) {
    // Устанавливаем флаг ручного изменения года
    isAutoSwitching.value = true
    
    // Используем GSAP версию shake эффекта
    triggerGsapShakeEffect()
    
    requestAnimationFrame(() => {
      emit('update:currentYear', props.currentYear + 1)
      
      // Сбрасываем флаг через небольшую задержку
      setTimeout(() => {
        isAutoSwitching.value = false
      }, 1000)
    })
  }
}

// 🚀 GSAP альтернатива для анимации shake (более мощная)
const triggerGsapShakeEffect = () => {
  if (timelineRef.value) {
    createShakeAnimation(timelineRef.value)
  }
}

// 🎨 GSAP анимация для смены года (более крутая чем CSS)
const animateYearChangeWithGsap = (yearElement: HTMLElement) => {
  return createYearChangeAnimation(yearElement)
}



// Computed для отслеживания завершения всех пузырей текущего года
const isCurrentYearCompleted = computed(() => {
  // Берем только пузыри текущего года
  const currentYearBubbles = bubbleStore.bubbles.filter(bubble => 
    bubble.year === props.currentYear &&
    !bubble.isHidden &&
    !bubble.isQuestion
  )
  
  if (currentYearBubbles.length === 0) {
    return true // Если нет пузырей в текущем году, считаем год завершённым
  }
  
  // Проверяем, все ли пузыри текущего года посещены
  const hasUnvisitedBubbles = currentYearBubbles.some(bubble => 
    !sessionStore.visitedBubbles.includes(bubble.id)
  )
  
  return !hasUnvisitedBubbles
})

// Debounce функция для предотвращения множественных срабатываний
let autoSwitchTimeout: number | null = null

const performAutoSwitch = async () => {
  if (isAutoSwitching.value || props.currentYear >= props.endYear || !isFinite(props.currentYear)) {
    return
  }
  
  isAutoSwitching.value = true
  
  await nextTick()
  
  setTimeout(() => {
    // Используем GSAP версию shake эффекта
    triggerGsapShakeEffect()
    
    setTimeout(() => {
      if (props.currentYear < props.endYear && isFinite(props.currentYear)) {
        const nextYear = props.currentYear + 1
        if (isFinite(nextYear) && nextYear <= props.endYear) {
          emit('update:currentYear', nextYear)
          

        }
        
        setTimeout(() => {
          isAutoSwitching.value = false
        }, 500)
      } else {
        isAutoSwitching.value = false
      }
    }, 300)
  }, 800)
}

// Добавляем watch для анимации смены года
watch(() => props.currentYear, async (newYear, oldYear) => {
  console.log('🎯 Year changed from', oldYear, 'to', newYear)
  await nextTick()
  const yearElement = document.querySelector('.year-compact') as HTMLElement
  if (yearElement) {
    animateYearChangeWithGsap(yearElement)
  }
  

})

// Отключено: автопереключение годов теперь управляется из useCanvas.ts
// watch([() => sessionStore.visitedBubbles.length, () => props.currentYear], () => {
//   // Очищаем предыдущий timeout
//   if (autoSwitchTimeout) {
//     clearTimeout(autoSwitchTimeout)
//   }
//   
//   // Проверяем завершение года с debounce только при изменении visitedBubbles
//   if (isCurrentYearCompleted.value && props.currentYear < props.endYear && !isAutoSwitching.value) {
//     autoSwitchTimeout = window.setTimeout(() => {
//       // Повторная проверка после задержки для уверенности
//       if (isCurrentYearCompleted.value && !isAutoSwitching.value && props.currentYear < props.endYear) {
//         performAutoSwitch()
//       }
//     }, 500) // Увеличена задержка для более стабильной работы
//   }
// }, { flush: 'post' })

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
  @apply absolute bottom-4 left-1/2 transform -translate-x-1/2;
  @apply bg-background-glass backdrop-blur-md rounded-lg;
  @apply border border-border p-2 sm:p-3;
  width: calc(100vw - 6rem);
  max-width: 400px;
}

.timeline-content {
  @apply w-full transition-all duration-300;
}

.timeline-header {
  @apply flex justify-between items-center mb-2;
}

  .timeline-header h3 {
    @apply text-xs sm:text-sm font-medium text-text-primary whitespace-nowrap;
  }

.navigation-compact {
  @apply flex items-center gap-0.5;
}

.nav-button-compact {
  @apply w-5 h-5 flex items-center justify-center rounded 
         bg-background-secondary hover:bg-background-card 
         disabled:opacity-30 disabled:cursor-not-allowed
         transition-all duration-150 hover:scale-105;
}

.nav-button-compact:hover:not(:disabled) {
  @apply bg-primary text-white;
}

.nav-icon-compact {
  @apply w-2.5 h-2.5;
}

.year-display {
  @apply relative w-12 h-5 overflow-hidden;
}

.year-wrapper {
  @apply absolute inset-0 flex items-center justify-center;
}

.year-compact {
  @apply text-xs font-medium px-1 text-center absolute;
  color: #6b7280; /* text-text-secondary */
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slider-container {
  @apply space-y-2;
}

.slider-with-labels {
  @apply flex items-center gap-2;
}

.year-label-side {
  @apply text-xs text-text-muted font-medium min-w-8 text-center;
}

.year-slider {
  @apply flex-1 h-1.5 bg-background-secondary rounded-lg appearance-none cursor-pointer;
}

.year-slider::-webkit-slider-thumb {
  @apply appearance-none w-3 h-3 bg-primary rounded-full cursor-pointer;
}


</style> 