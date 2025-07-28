import { defineStore } from 'pinia'
import type { ContactFormStore } from '@/usecases/contact'

export const useContactFormStore = defineStore('contactForm', {
  state: (): ContactFormStore => ({
    isSubmitting: false,
    error: null,
    success: false,
    setSubmitting: () => {},
    setError: () => {},
    setSuccess: () => {},
    resetState: () => {}
  }),

  actions: {
    setSubmitting(submitting: boolean) {
      this.isSubmitting = submitting
    },

    setError(errorMessage: string | null) {
      this.error = errorMessage
    },

    setSuccess(successValue: boolean) {
      this.success = successValue
    },

    resetState() {
      this.error = null
      this.success = false
    }
  }
}) 