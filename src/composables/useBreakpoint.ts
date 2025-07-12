import { ref, computed, onMounted, onUnmounted } from 'vue'

const windowWidth = ref(0)

export function useBreakpoint() {
  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  const isMobile = computed(() => windowWidth.value < 640)
  const isTablet = computed(() => windowWidth.value >= 640 && windowWidth.value < 1024)
  const isDesktop = computed(() => windowWidth.value >= 1024)
  const isSmallMobile = computed(() => windowWidth.value < 360)

  return {
    windowWidth: computed(() => windowWidth.value),
    isMobile,
    isTablet, 
    isDesktop,
    isSmallMobile
  }
} 