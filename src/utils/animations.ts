import { gsap } from 'gsap'
import type { BubbleNode } from '@/types/canvas'

// ===== SHINE АНИМАЦИИ =====

/**
 * Создает shine анимацию для элемента
 * @param selector - CSS селектор элемента
 * @param options - опции анимации
 */
export function createShineAnimation(
  selector: string,
  options: {
    duration?: number
    repeatDelay?: number
    ease?: string
  } = {}
) {
  const {
    duration = 1.5,
    repeatDelay = 4,
    ease = 'power2.out'
  } = options

  gsap.killTweensOf(selector)
  
  const shineElement = document.querySelector(selector)
  if (shineElement) {
    gsap.fromTo(selector, 
      { x: '-100%' },
      {
        x: '100%',
        duration,
        ease,
        repeat: -1,
        repeatDelay
      }
    )
  }
}

/**
 * Останавливает shine анимацию для элемента
 * @param selector - CSS селектор элемента
 */
export function stopShineAnimation(selector: string) {
  gsap.killTweensOf(selector)
}

/**
 * Создает shine анимацию для уровня
 * @param level - текущий уровень
 */
export function createLevelShineAnimation(level: number) {
  if (level >= 2) {
    createShineAnimation('.level-shine', {
      duration: 1.5,
      repeatDelay: 4,
      ease: 'power2.out'
    })
  }
}

/**
 * Останавливает shine анимацию уровня
 */
export function stopLevelShineAnimation() {
  stopShineAnimation('.level-shine')
}

// ===== ЖИЗНИ АНИМАЦИИ =====

/**
 * Создает анимацию биения сердца для последней жизни
 * @param element - HTML элемент сердца
 * @returns Timeline анимации
 */
export function createHeartbeatAnimation(element: HTMLElement): gsap.core.Timeline {
  return gsap.timeline({
    repeat: -1,
    defaults: { ease: "power3.inOut" }
  })
  .to(element, {
    scale: 2.2,
    filter: 'brightness(1.3)',
    duration: 0.2
  })
  .to(element, {
    scale: 0.7,
    filter: 'brightness(1)',
    duration: 0.15
  })
  .to(element, {
    scale: 3,
    filter: 'brightness(1.2)',
    duration: 0.2
  })
  .to(element, {
    scale: 1,
    filter: 'brightness(1)',
    duration: 0.15
  })
  .to({}, {
    duration: 1.3
  })
}

/**
 * Сбрасывает анимацию сердца
 * @param element - HTML элемент сердца
 */
export function resetHeartAnimation(element: HTMLElement) {
  gsap.set(element, { scale: 1, filter: 'brightness(1)' })
}

// ===== TIMELINE АНИМАЦИИ =====

/**
 * Создает shake анимацию для элемента
 * @param element - HTML элемент
 */
export function createShakeAnimation(element: HTMLElement) {
  gsap.to(element, {
    x: "+=2",
    y: "+=1", 
    duration: 0.1,
    repeat: 5,
    yoyo: true,
    ease: "power2.inOut",
    onComplete: () => {
      gsap.set(element, { x: 0, y: 0 })
    }
  })
}

/**
 * Создает анимацию смены года
 * @param element - HTML элемент года
 * @returns Timeline анимации
 */
export function createYearChangeAnimation(element: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline()
  
  gsap.set(element, {
    y: 25,
    scale: 0.8,
    opacity: 0,
    color: "#667eea",
    textShadow: "0 0 20px rgba(102, 126, 234, 0.5)"
  })
  
  tl.to(element, {
    y: 0,
    scale: 1.15,
    opacity: 1,
    duration: 0.3,
    ease: "back.out(1.7)"
  })
  .to(element, {
    scale: 0.95,
    duration: 0.15,
    ease: "power2.out"
  })
  .to(element, {
    scale: 1,
    duration: 0.15,
    ease: "power2.out"
  })
  .to(element, {
    color: "#764ba2",
    textShadow: "0 0 12px rgba(118, 75, 162, 0.3)",
    duration: 0.2
  }, "-=0.3")
  .to(element, {
    color: "#8b9dc3",
    textShadow: "0 0 8px rgba(102, 126, 234, 0.2)",
    duration: 0.2
  })
  .to(element, {
    color: "#6b7280",
    textShadow: "none",
    duration: 0.3,
    ease: "power2.out"
  })
  
  return tl
}

/**
 * Создает быструю GSAP анимацию года по центру экрана
 * @param element - HTML элемент года
 * @param onComplete - callback функция по завершению
 * @returns Timeline анимации
 */
export function createYearTransitionAnimation(element: HTMLElement, onComplete?: () => void): gsap.core.Timeline {
  const tl = gsap.timeline({
    onComplete
  })
  
  // Начальное состояние
  gsap.set(element, {
    scale: 0.5,
    opacity: 0,
    y: 50
  })
  
  // Быстрая анимация появления
  tl.to(element, {
    scale: 1,
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: "back.out(1.7)"
  })
  // Пульсация
  .to(element, {
    scale: 1.2,
    duration: 0.15,
    ease: "power2.out"
  })
  .to(element, {
    scale: 1.1,
    duration: 0.15,
    ease: "power2.inOut"
  })
  // Быстрое исчезновение
  .to(element, {
    scale: 0.8,
    opacity: 0,
    y: -30,
    duration: 0.4,
    ease: "power2.in"
  })
  
  return tl
}

// ===== CANVAS АНИМАЦИИ =====

/**
 * Анимирует параллакс эффект
 * @param parallaxOffset - объект с координатами смещения
 * @param mouseX - X координата мыши
 * @param mouseY - Y координата мыши
 * @param centerX - X центра экрана
 * @param centerY - Y центра экрана
 */
export function animateParallax(
  parallaxOffset: { x: number, y: number },
  mouseX: number,
  mouseY: number,
  centerX: number,
  centerY: number
) {
  const strength = 0.008
  const targetX = (mouseX - centerX) * strength * -1
  const targetY = (mouseY - centerY) * strength * -1

  gsap.to(parallaxOffset, {
    x: targetX,
    y: targetY,
    duration: 1.2,
    ease: 'power2.out'
  })
}

/**
 * Анимирует удар по прочному пузырю
 * @param bubble - пузырь для анимации
 */
export function animateToughBubbleHit(bubble: BubbleNode) {
  gsap.killTweensOf(bubble, 'targetRadius')
  bubble.targetRadius = (bubble.targetRadius || bubble.baseRadius) * 1.08
  gsap.to(bubble, {
    targetRadius: bubble.baseRadius,
    duration: 1.2,
    ease: 'elastic.out(1, 0.6)',
    delay: 0.1
  })
}

 