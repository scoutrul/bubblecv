import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUiEventStore, useSessionStore } from '@/stores'


export function useUi() {

  const isXPAnimating = ref(false)
  const shakingComponents = ref(new Set<string>())

  const sessionStore = useSessionStore()

  const uiEventStore = useUiEventStore()


  const animateXPGain = () => {
    isXPAnimating.value = true
    setTimeout(() => {
      isXPAnimating.value = false
    }, 200)
  }

  const handleProcessShakeQueue = () => {
    const componentsToShake = uiEventStore.consumeShakeQueue()
    if (componentsToShake.size > 0) {
      shakingComponents.value = componentsToShake
      setTimeout(() => {
        shakingComponents.value.clear()
      }, 700)
    }
  }

  onMounted(() => {
    window.addEventListener('process-shake-queue', handleProcessShakeQueue)
  })

  onUnmounted(() => {
    window.removeEventListener('process-shake-queue', handleProcessShakeQueue)
  })

  watch(() => sessionStore.currentXP, (newXP, oldXP) => {
    if (newXP > oldXP) animateXPGain()
  })

  return {
    isXPAnimating,
    shakingComponents
  }
}1