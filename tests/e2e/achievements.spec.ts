import { test, expect } from '@playwright/test'

test.describe('🏆 Achievements Flow', () => {
  test('должен выдавать ачивку "Силач" за уничтожение крепкого пузыря', async ({ page }) => {
    await page.goto('/')

    // Ждем появления пузырей на холсте
    await expect(page.locator('[data-testid^="bubble-"]')).not.toHaveCount(0, { timeout: 10000 })

    const toughBubbleId = 'git'
    const toughBubbleClicks = 3 // По умолчанию 3 клика
    const toughBubbleSelector = `[data-testid="bubble-${toughBubbleId}"]`

    // Находим крепкий пузырь
    const toughBubble = page.locator(toughBubbleSelector)
    await expect(toughBubble).toBeVisible()

    // Кликаем по нему нужное количество раз
    for (let i = 0; i < toughBubbleClicks; i++) {
      await test.step(`Клик по крепкому пузырю #${i + 1}`, async () => {
        await toughBubble.click({ force: true }) // force: true, т.к. пузырь может двигаться
      })
    }
    
    // Проверяем, что появилось модальное окно ачивки
    await test.step('Проверка модального окна ачивки', async () => {
      const achievementModal = page.locator('[data-testid="achievement-modal"]')
      await expect(achievementModal).toBeVisible({ timeout: 5000 })
      await expect(achievementModal.locator('h2')).toHaveText('Силач')
      
      // Закрываем модалку ачивки
      await achievementModal.locator('button', { hasText: 'Круто!' }).click()
      await expect(achievementModal).not.toBeVisible()
    })

    // Проверяем, что следом открылось модальное окно самого пузыря
    await test.step('Проверка модального окна пузыря', async () => {
      const bubbleModal = page.locator('[data-testid="bubble-modal"]')
      await expect(bubbleModal).toBeVisible()
      await expect(bubbleModal.locator('h2')).toHaveText('Git')

      // Закрываем его
      await bubbleModal.locator('button', { hasText: 'Продолжить' }).click()
      await expect(bubbleModal).not.toBeVisible()
    })

    // Проверяем, что пузырь исчез
    await test.step('Проверка исчезновения пузыря', async () => {
      await expect(toughBubble).not.toBeVisible({ timeout: 2000 })
    })
  })
}) 