import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SKILL_LEVELS, SKILL_LEVEL_SCALE_MAP } from '@shared/constants/skill-levels'
import {
  isWindows,
  hexToRgb,
  calculateAdaptiveSizes,
  wrapText,
  calculateBubbleScale
} from './canvasUtils'

describe('🎨 canvasUtils', () => {

  describe('isWindows', () => {
    const originalNavigator = window.navigator

    afterEach(() => {
      Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        writable: true
      })
    })

    it('должна возвращать true для Windows платформ', () => {
      const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
      windowsPlatforms.forEach(platform => {
        Object.defineProperty(window, 'navigator', {
          value: { platform },
          configurable: true
        })
        expect(isWindows()).toBe(true)
      })
    })

    it('должна возвращать false для не-Windows платформ', () => {
      const nonWindowsPlatforms = ['MacIntel', 'Linux x86_64', 'iPhone']
      nonWindowsPlatforms.forEach(platform => {
        Object.defineProperty(window, 'navigator', {
          value: { platform },
          configurable: true
        })
        expect(isWindows()).toBe(false)
      })
    })

    it('должна работать в окружении без window (SSR)', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      expect(isWindows()).toBe(false)
      global.window = originalWindow
    })
  })

  describe('hexToRgb', () => {
    it('должна корректно конвертировать hex в rgb', () => {
      expect(hexToRgb('#ff5733')).toEqual({ r: 255, g: 87, b: 51 })
    })

    it('должна работать без символа #', () => {
      expect(hexToRgb('33ff57')).toEqual({ r: 51, g: 255, b: 87 })
    })

    it('должна возвращать дефолтный цвет для невалидного hex', () => {
      expect(hexToRgb('#invalid')).toEqual({ r: 102, g: 126, b: 234 })
      expect(hexToRgb('123')).toEqual({ r: 102, g: 126, b: 234 })
    })

    it('не должна поддерживать короткий формат hex (ожидается дефолт)', () => {
      expect(hexToRgb('#f53')).toEqual({ r: 102, g: 126, b: 234 })
    })
  })

  describe('calculateAdaptiveSizes', () => {
    it('должна рассчитывать размеры для стандартного экрана', () => {
      const sizes = calculateAdaptiveSizes(50, 1920, 1080)
      expect(sizes.min).toBeGreaterThan(0)
      expect(sizes.max).toBeGreaterThan(sizes.min)
      expect(sizes.max).toBeLessThanOrEqual(1080 / 8) // maxAllowedRadius
    })

    it('должна возвращать большие размеры для меньшего количества пузырей', () => {
      const sizesFew = calculateAdaptiveSizes(10, 1920, 1080)
      const sizesMany = calculateAdaptiveSizes(100, 1920, 1080)
      expect(sizesFew.max).toBeGreaterThan(sizesMany.max)
      expect(sizesFew.min).toBeGreaterThan(sizesMany.min)
    })

    it('должна адаптироваться к портретному режиму', () => {
      const sizes = calculateAdaptiveSizes(50, 1080, 1920)
      expect(sizes.max).toBeLessThanOrEqual(1080 / 8)
    })
    
    it('должна обрабатывать граничные случаи (мало пузырей, маленький экран)', () => {
        const sizes = calculateAdaptiveSizes(1, 100, 100)
        expect(sizes.min).toBeGreaterThan(0)
        expect(sizes.max).toBeLessThanOrEqual(100/8)
    })
  })

  describe('wrapText', () => {
    it('должна разбивать простой текст на строки', () => {
      const { lines } = wrapText('Простой текст для теста', 100)
      expect(lines.length).toBeGreaterThanOrEqual(2)
      expect(lines.join(' ')).toBe('Простой текст для теста')
    })

    it('должна переносить очень длинное слово с дефисом', () => {
      const { lines } = wrapText('ОченьДлинноеСловоБезПробелов', 50)
      expect(lines.length).toBeGreaterThan(1)
      expect(lines[0]).toContain('-')
      expect(lines.join('').replace(/-/g, '')).toBe('ОченьДлинноеСловоБезПробелов')
    })
    
    it('должна обрезать текст до 3 строк с многоточием', () => {
        const longText = 'Это очень длинный текст который определенно не поместится в три строки и должен быть обрезан'
        const { lines } = wrapText(longText, 60)
        expect(lines.length).toBe(3)
        expect(lines[2]).toMatch(/\.\.\.$/)
    })

    it('должна рассчитывать scaleFactor на основе skillLevel', () => {
      const { scaleFactor: scaleNovice } = wrapText('Test', 100, SKILL_LEVELS.NOVICE)
      const { scaleFactor: scaleExpert } = wrapText('Test', 100, SKILL_LEVELS.EXPERT)
      
      expect(scaleExpert).toBe(SKILL_LEVEL_SCALE_MAP[SKILL_LEVELS.EXPERT])
      expect(scaleNovice).toBe(SKILL_LEVEL_SCALE_MAP[SKILL_LEVELS.NOVICE])
    })

    it('должна уменьшать scaleFactor для длинных слов', () => {
      const { scaleFactor: scaleShort } = wrapText('короткое слово', 100, SKILL_LEVELS.INTERMEDIATE)
      const { scaleFactor: scaleLong } = wrapText('невероятнодлинноеслово', 100, SKILL_LEVELS.INTERMEDIATE)
      expect(scaleLong).toBeLessThan(scaleShort)
    })
  })

  describe('calculateBubbleScale', () => {
    it('должна возвращать базовый масштаб для skillLevel', () => {
        const scale = calculateBubbleScale('Test', SKILL_LEVELS.CONFIDENT)
        expect(scale).toBe(SKILL_LEVEL_SCALE_MAP[SKILL_LEVELS.CONFIDENT])
    })
    
    it('должна уменьшать масштаб для длинных слов', () => {
        const baseScale = SKILL_LEVEL_SCALE_MAP[SKILL_LEVELS.EXPERT]
        if (typeof baseScale !== 'number') {
          throw new Error('SKILL_LEVEL_SCALE_MAP[SKILL_LEVELS.EXPERT] is not defined')
        }
        const longWordScale = calculateBubbleScale('ДлиннющееСловоДляТеста', SKILL_LEVELS.EXPERT)
        expect(longWordScale).toBeLessThan(baseScale)
    })

    it('не должна изменять масштаб для коротких слов', () => {
        const baseScale = SKILL_LEVEL_SCALE_MAP[SKILL_LEVELS.MASTER]
        if (typeof baseScale !== 'number') {
          throw new Error('SKILL_LEVEL_SCALE_MAP[SKILL_LEVELS.MASTER] is not defined')
        }
        const shortWordScale = calculateBubbleScale('коротко', SKILL_LEVELS.MASTER)
        expect(shortWordScale).toBe(baseScale)
    })
  })
}) 