import { test, expect } from '@playwright/test';

test.describe('Bubbles Resume Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ждем загрузки основных компонентов
    await page.waitForSelector('.game-hud');
    // Ждем загрузки данных и появления пузырей
    await page.waitForSelector('.bubble', { timeout: 10000 });
  });

  test('should load initial bubbles', async ({ page }) => {
    // Проверяем, что SVG с пузырями загрузился
    await expect(page.locator('.bubble-svg')).toBeVisible();
    
    // Проверяем, что есть пузыри
    const bubbles = page.locator('.bubble');
    const count = await bubbles.count();
    expect(count).toBeGreaterThan(0);
    
    // Проверяем, что HUD отображается
    await expect(page.locator('.game-hud')).toBeVisible();
  });

  test('should show XP progress', async ({ page }) => {
    // Проверяем наличие XP контейнера
    const xpContainer = page.locator('.xp-container');
    await expect(xpContainer).toBeVisible();
    
    // Проверяем прогресс-бар
    const progressBar = page.locator('.progress-bar');
    await expect(progressBar).toBeVisible();
    
    // Проверяем, что есть текст с XP
    const xpText = await page.locator('.xp-container .text-text-secondary').textContent();
    expect(xpText).toBeTruthy();
    expect(xpText).toContain('/'); // Формат должен быть "X / Y"
    
    // Парсим значения XP
    const [current, max] = xpText!.split('/').map(x => parseInt(x.trim()));
    expect(current).toBeGreaterThanOrEqual(0);
    expect(max).toBeGreaterThan(0);
    expect(current).toBeLessThanOrEqual(max);
  });

  test('should interact with bubbles', async ({ page }) => {
    // Находим первый пузырь и кликаем по нему
    const firstBubble = page.locator('.bubble').first();
    await firstBubble.click();
    
    // Проверяем, что модальное окно открылось
    await expect(page.locator('.bubble-modal')).toBeVisible();
    
    // Проверяем, что XP увеличилось
    const xpText = await page.locator('.xp-container .text-text-secondary').textContent();
    const [current] = xpText!.split('/').map(x => parseInt(x.trim()));
    expect(current).toBeGreaterThan(0);
  });

  test('should filter bubbles by year', async ({ page }) => {
    // Находим слайдер временной шкалы
    const timelineSlider = page.locator('.timeline input[type="range"]');
    await expect(timelineSlider).toBeVisible();
    
    // Запоминаем начальное количество пузырей
    const initialCount = await page.locator('.bubble').count();
    expect(initialCount).toBeGreaterThan(0);
    
    // Перемещаем слайдер на 2020 год
    await timelineSlider.evaluate((el: HTMLInputElement) => {
      el.value = '2020';
      el.dispatchEvent(new Event('input'));
      el.dispatchEvent(new Event('change'));
    });
    
    // Ждем обновления пузырей
    await page.waitForTimeout(500);
    
    // Проверяем, что количество пузырей изменилось
    const filteredCount = await page.locator('.bubble').count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should handle mobile layout', async ({ page }) => {
    // Устанавливаем мобильный вьюпорт
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Проверяем, что HUD адаптировался
    const gameHud = page.locator('.game-hud');
    const hudBox = await gameHud.boundingBox();
    expect(hudBox?.width).toBeLessThan(375);
    
    // Проверяем, что временная шкала адаптировалась
    const timeline = page.locator('.timeline');
    const timelineBox = await timeline.boundingBox();
    expect(timelineBox?.width).toBeLessThan(375);
  });

  test('should handle achievements', async ({ page }) => {
    // Проверяем кнопку достижений
    const achievementsButton = page.locator('.achievements-container button');
    await expect(achievementsButton).toBeVisible();
    
    // Открываем панель достижений
    await achievementsButton.click();
    
    // Проверяем, что панель открылась
    await expect(page.locator('.achievements-panel')).toBeVisible();
  });
}); 