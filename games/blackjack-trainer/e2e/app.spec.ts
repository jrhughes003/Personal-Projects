import { expect, test, type Page } from '@playwright/test'

const visible = (page: Page, selector: string) => page.locator(selector).filter({ visible: true })

async function openScreen(page: Page, name: string) {
  await page
    .getByRole('navigation', { name: 'Screens' })
    .getByRole('button', { name: new RegExp(name) })
    .click()
}

/** Deal and play one hand at the table by standing, answering any prompts. */
async function playHand(page: Page) {
  const check = visible(page, '.count-check input')
  if (await check.count()) {
    await check.fill('0')
    await check.press('Enter')
  }
  await visible(page, 'button.deal').click()
  for (let i = 0; i < 6; i++) {
    if (await visible(page, '.insurance').count()) await page.keyboard.press('n')
    else if (await visible(page, '.action-bar').count()) await page.keyboard.press('s')
    else break
  }
  await expect(visible(page, 'button.deal')).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('strategy drill grades an answer', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Strategy drill' })).toBeVisible()
  await page.keyboard.press('h')
  await expect(visible(page, '.feedback')).toHaveClass(/ok|bad/)
  await expect(visible(page, '.scorebar')).toContainText('/1')
})

test('count deviation drill shows a true count', async ({ page }) => {
  await page.getByRole('button', { name: 'Count deviations' }).click()
  await expect(visible(page, '.tc-badge')).toContainText('True count')
})

test('table plays hands and keeps the shoe across screens', async ({ page }) => {
  await openScreen(page, 'Table')
  await playHand(page)
  await playHand(page)
  await expect(visible(page, '.scorebar')).toContainText('Hands 2')
  await expect(visible(page, '.log li').first()).toBeVisible()

  await openScreen(page, 'Reference')
  await expect(page.getByRole('heading', { name: 'Basic strategy' })).toBeVisible()
  await openScreen(page, 'Table')
  await expect(visible(page, '.scorebar')).toContainText('Hands 2')
})

test('side bets can be enabled, placed and settled', async ({ page }) => {
  await openScreen(page, 'Settings')
  await page.getByLabel('21+3', { exact: true }).check()
  await page.getByLabel('Perfect Pairs', { exact: true }).check()
  await openScreen(page, 'Table')
  await visible(page, '.side-spot').first().click()
  await expect(visible(page, '.side-spot.on')).toHaveCount(1)
  await playHand(page)
  await expect(visible(page, '.side-results')).toContainText('21+3')
})

test('true count drill checks an answer', async ({ page }) => {
  await openScreen(page, 'Counting')
  await page.getByRole('button', { name: 'True count' }).click()
  await page.getByLabel('True count (whole number)?').fill('1')
  await page.keyboard.press('Enter')
  await expect(visible(page, '.verdict')).toBeVisible()
})

test('settings persist across restarts', async ({ page }) => {
  await openScreen(page, 'Settings')
  await page.getByLabel('Count system').selectOption('zen')
  await page.reload()
  await expect(page.locator('.brand')).toContainText('Zen counter')
})

test('progress and reference screens render', async ({ page }) => {
  await openScreen(page, 'Progress')
  await expect(page.locator('.tile-label', { hasText: 'Play accuracy' })).toBeVisible()
  await openScreen(page, 'Reference')
  await expect(page.getByRole('heading', { name: 'Side bets' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Hi-Lo index plays' })).toBeVisible()
})
