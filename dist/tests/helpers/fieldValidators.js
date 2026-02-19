import { expect } from '@playwright/test';
import { isGreenish, isLightGreenish, isYellowish, isLightYellowish, isGreyish, isReddish } from './colorValidators.js';
import { enderecoSelectors } from '../../src/data/enderecoSelectors.js';


/**
 * Prüft ob die Endereco Error-Liste sichtbar oder nicht sichtbar ist
 * @param {import('@playwright/test').Page} page - Die Playwright Page-Instanz
 * @param {boolean} shouldBeVisible - true wenn Error-Liste sichtbar sein soll, false wenn nicht
 */
export async function enderecoErrorList(page, shouldBeVisible) {
  const errorList = page.locator(enderecoSelectors.errorList);
  
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
export async function shopwareFeedback(page, feedBackLocator, shouldBeVisible) {
  const feedback = page.locator(feedBackLocator);

  if (shouldBeVisible) {
    await expect(feedback).toBeVisible();
  } else {
    await expect(feedback).not.toBeVisible();
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

export  async function validateFieldState(page, inputField, messageArr, color) {
  //Prüfe, ob die richtige Anzahl an Fehlermeldungen angezeigt wird, und wenn Fehlermeldungen
  // erwartet werden, ob die korrekten Texte enthalten sind
  if (messageArr.length > 0) {
      await enderecoErrorList(page, true);
      const errorList = page.locator(enderecoSelectors.errorList);
      const errorItems = errorList.locator(enderecoSelectors.errorItems);
      await expect(errorItems).toHaveCount(messageArr.length);
      await expect(errorItems).toContainText(messageArr);
  } else {
      await enderecoErrorList(page, false);
  }

  //Prüfe die CSS-Farben des Eingabefeldes
  await checkCSSColors(inputField, color);
}
