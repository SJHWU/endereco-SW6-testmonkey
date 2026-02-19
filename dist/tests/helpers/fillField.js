/**
 * Helper-Funktion zum Ausfüllen und Warten
 */

export async function fillAndWait(page, locator, value, waitTime = 3000) {
  await locator.fill(value);
  await locator.blur();
  await page.waitForTimeout(waitTime);
}
