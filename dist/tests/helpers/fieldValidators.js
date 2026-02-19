/**
 * Allgemeine Helper-Funktionen für Feld-Validierung
 * Wiederverwendbar für E-Mail, Telefon, Adresse etc.
 */

import { expect } from '@playwright/test';
import { isGreenish, isLightGreenish, isYellowish, isLightYellowish, isGreyish, isReddish } from './colorValidators.js';


/**
 * Prüft ob die Endereco Error-Liste sichtbar oder nicht sichtbar ist
 * @param {import('@playwright/test').Page} page - Die Playwright Page-Instanz
 * @param {boolean} shouldBeVisible - true wenn Error-Liste sichtbar sein soll, false wenn nicht
 */
export async function expectErrorList(page, shouldBeVisible) {
  const errorList = page.locator('.endereco-status-wrapper-list');
  if (shouldBeVisible) {
    await expect(errorList).toBeVisible();
  } else {
    await expect(errorList).not.toBeVisible();
  }
}

/**
 * Prüft ob Shopware personalMail feedback sichtbar ist
 * @param {import('@playwright/test').Page} page - Die Playwright Page-Instanz
 * @param {boolean} shouldBeVisible - true wenn Error-Liste sichtbar sein soll, false wenn nicht
 */
export async function expectShopwareMailFeedback(page, shouldBeVisible) {
  const personalMailFeedback = page.locator('#personalMail-feedback');
  if (shouldBeVisible) {
    await expect(personalMailFeedback).toBeVisible();
  } else {
    await expect(personalMailFeedback).not.toBeVisible();
  }
}

/**
 * Prüft die CSS-Farben eines Eingabefeldes (Background und Border-Bottom)
 * @param {import('@playwright/test').Locator} inputField - Das zu prüfende Eingabefeld
 * @param {string} color - Die erwartete Farbe: 'yellow', 'green' oder 'none'
 */
export async function checkCSSColors(inputField, color) {
  const bgColor = await inputField.evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  );
  const borderBottomColor = await inputField.evaluate(el =>
    window.getComputedStyle(el).borderBottomColor
  );

  if (color === 'none') {
    // Prüfe dass keine Endereco-Färbung vorhanden ist
    expect(bgColor).toBe('rgb(255, 255, 255)');
    
    expect(isGreyish(borderBottomColor) || isReddish(borderBottomColor)).toBeTruthy();
  } else {
    const colorFunctionsMap = {
      green: { light: isLightGreenish, main: isGreenish },
      yellow: { light: isLightYellowish, main: isYellowish }
    };
    
    // Validiere dass Farben im erwarteten Spektrum liegen
    expect(colorFunctionsMap[color].light(bgColor)).toBeTruthy();
    expect(colorFunctionsMap[color].main(borderBottomColor)).toBeTruthy();
  }
}

export  async function validateFieldState(page, inputField, hasErrorList, messageArr, color) {
  //Prüfen ob Error List erwartungsgemäß sichtbar/nicht sichtbar ist
  await expectErrorList(page, hasErrorList);
  
  //Prüfe, ob die richtige Anzahl an Fehlermeldungen angezeigt wird, und wenn Fehlermeldungen
  // erwartet werden, ob die korrekten Texte enthalten sind
  if (messageArr.length > 0) {
      const errorList = page.locator('.endereco-status-wrapper-list');
      const errorItems = errorList.locator('li.endereco-status-wrapper-list__item');
      await expect(errorItems).toHaveCount(messageArr.length);
      await expect(errorItems).toContainText(messageArr);
  }
  
  await checkCSSColors(inputField, color);
}
