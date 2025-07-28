import type { ComputedRef } from 'vue'
import type { UserSession } from '@/types/session'

export interface ContactMessage {
  name: string
  contact: string 
  message: string
}

export interface SendMessageParams {
  message: ContactMessage
}

export interface SendMessageResult {
  success: boolean
  error?: string
}

export interface ContactFormState {
  isSubmitting: boolean
  error: string | null
  success: boolean
}

export interface ContactFormStore {
  isSubmitting: boolean
  error: string | null
  success: boolean
  setSubmitting(submitting: boolean): void
  setError(error: string | null): void
  setSuccess(success: boolean): void
  resetState(): void
}

export interface ContactSessionStore {
  session: { value: UserSession | null }
}

export interface ContactRepository {
  sendMessage(text: string): Promise<boolean>
}

export interface ContactUseCase {
  sendMessage(params: SendMessageParams): Promise<SendMessageResult>
  resetState(): void
} 