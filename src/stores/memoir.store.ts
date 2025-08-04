import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api'
import { useSessionStore } from '@/stores/session.store'
import { normalizeMemoir } from '@/utils'
import type { NormalizedMemoir } from '@/types/normalized'

export const useMemoirStore = defineStore('memoirStore', () => {
  const memoirs = ref<NormalizedMemoir[]>([])
  const isLoading = ref(true)

  const loadMemoirs = async () => {
    try {
      isLoading.value = true
      const { data } = await api.getMemoirs()
      memoirs.value = data.map(normalizeMemoir)
      
      // Автоматически разблокируем мемуары на основе текущего уровня
      updateUnlockedMemoirs()
    } catch (error) {
      console.error('❌ Ошибка загрузки мемуаров:', error)
    } finally {
      isLoading.value = false
    }
  }

  const getMemoirByLevel = (level: number) => 
    memoirs.value.find((memoir) => memoir.level === level)

  const unlockMemoirForLevel = (level: number) => {
    const memoir = getMemoirByLevel(level)
    if (memoir) {
      memoir.isUnlocked = true
    }
  }

  const unlockedMemoirs = computed(() => 
    memoirs.value.filter((memoir) => memoir.isUnlocked)
  )

  // Реактивная разблокировка мемуаров на основе текущего уровня
  const updateUnlockedMemoirs = () => {
    const sessionStore = useSessionStore()
    const currentLevel = sessionStore.currentLevel
    
    memoirs.value.forEach((memoir) => {
      if (memoir.level <= currentLevel && !memoir.isUnlocked) {
        memoir.isUnlocked = true
      }
    })
  }

  const resetMemoirs = () => {
    memoirs.value.forEach((memoir) => {
      memoir.isUnlocked = false
    })
    // Разблокируем только мемуар первого уровня
    updateUnlockedMemoirs()
  }

  // Методы для работы с прочитанными мемуарами
  const isMemoirRead = (memoirId: string): boolean => {
    const memoir = memoirs.value.find(m => String(m.id) === memoirId)
    return memoir?.isRead || false
  }

  const markMemoirAsRead = (memoirId: string) => {
    const memoir = memoirs.value.find(m => String(m.id) === memoirId)
    if (memoir) {
      memoir.isRead = true
    }
  }

  const resetReadMemoirs = () => {
    memoirs.value.forEach(memoir => {
      memoir.isRead = false
    })
  }

  const getReadMemoirsCount = (): number => {
    return memoirs.value.filter(memoir => memoir.isRead).length
  }

  return {
    memoirs,
    unlockedMemoirs,
    isLoading,
    loadMemoirs,
    getMemoirByLevel,
    unlockMemoirForLevel,
    updateUnlockedMemoirs,
    resetMemoirs,
    // Методы для прочитанных мемуаров
    isMemoirRead,
    markMemoirAsRead,
    resetReadMemoirs,
    getReadMemoirsCount
  }
}) 