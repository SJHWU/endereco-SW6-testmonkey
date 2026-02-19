/**
 * Helper-Funktionen für Korrektur-Validierungen
 * Wiederverwendbar für E-Mail, Telefon, Adresse etc.
 */


import { fillAndWait } from './fillField.js';
import { expectErrorList, expectShopwareMailFeedback, checkCSSColors, validateFieldState } from './fieldValidators.js';


/**
 * Korrigiert eine E-Mail-Eingabe und validiert die grüne Färbung
 * @param {import('@playwright/test').Page} page - Die Playwright Page-Instanz
 * @param {import('@playwright/test').Locator} emailInput - Das E-Mail-Input-Locator
 * @param {string} validEmail - Eine gültige E-Mail-Adresse zur Korrektur
 */
export async function eMailCorrection(page, emailInput, validEmail) {
  // Korrigiere die E-Mail und prüfe dass die Fehlermeldung verschwindet
  await page.waitForTimeout(500);
  await fillAndWait(page, emailInput, validEmail);
  
  await validateFieldState(page, emailInput, false, [], 'green');
  await expectShopwareMailFeedback(page, false);
}

//Korrigiert eine Telefon-Eingabe und validiert die grüne Färbung
export async function phoneCorrection(page, phoneInput, validPhone) {
  // Korrigiere die Telefonnummer und prüfe dass die Fehlermeldung verschwindet
  await page.waitForTimeout(500);
  await fillAndWait(page, phoneInput, validPhone);

  await validateFieldState(page, phoneInput, false, [], 'green');
}