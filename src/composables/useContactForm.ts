import { computed } from 'vue'
import { useContactFormStore, useSessionStore } from '@/stores'
import { ContactUseCaseFactory } from '@/usecases/contact'
import type { ContactMessage } from '@/usecases/contact'

export function useContactForm() {
  const contactFormStore = useContactFormStore()
  const sessionStore = useSessionStore()

  // Создаем адаптер для session store
  const sessionAdapter = {
    session: { value: sessionStore.session }
  }

  // Создаем фабрику use cases
  const factory = new ContactUseCaseFactory(
    contactFormStore,
    sessionAdapter
  )

  // Создаем экземпляры use cases
  const sendMessageUseCase = factory.createSendMessageUseCase()
  const resetContactFormUseCase = factory.createResetContactFormUseCase()

  // Computed свойства для состояния формы
  const isSubmitting = computed(() => contactFormStore.isSubmitting)
  const error = computed(() => contactFormStore.error)
  const success = computed(() => contactFormStore.success)

  const sendMessage = async (data: ContactMessage) => {
    const result = await sendMessageUseCase.execute({ message: data })
    return result.success
  }

  const resetState = () => {
    resetContactFormUseCase.execute()
  }

  return {
    isSubmitting,
    error,
    success,
    sendMessage,
    resetState
  }
} 