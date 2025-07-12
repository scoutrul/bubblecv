import { gsap } from 'gsap'

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