import { CanvasUseCase } from './CanvasUseCase'
import { PhysicsRepository } from './PhysicsRepository'
import { EffectsRepository } from './EffectsRepository'
import { CanvasRepository } from './CanvasRepository'
import { BubbleManagerRepository } from './BubbleManagerRepository'
import type { 
  BubbleStore, 
  SessionStore, 
  CanvasModalStore 
} from './types'
import type { Ref } from 'vue'
import type { BubbleNode } from '@/types/canvas'

export class CanvasUseCaseFactory {
  constructor(
    private bubbleStore: BubbleStore,
    private sessionStore: SessionStore,
    private modalStore: CanvasModalStore
  ) {}

  createCanvasUseCase(
    canvasRef: Ref<HTMLCanvasElement | null>,
    useSession: ReturnType<typeof import('@/composables/useSession').useSession>,
    onBubblePopped?: (nodes: BubbleNode[]) => void
  ): CanvasUseCase {
    const canvasRepository = new CanvasRepository(canvasRef)
    const physicsRepository = new PhysicsRepository()
    const effectsRepository = new EffectsRepository()
    const bubbleManagerRepository = new BubbleManagerRepository()

    return new CanvasUseCase(
      canvasRepository,
      physicsRepository,
      effectsRepository,
      bubbleManagerRepository,
      this.bubbleStore,
      this.sessionStore,
      this.modalStore,
      useSession,
      onBubblePopped
    )
  }
} 