import { expect } from '@playwright/test';
import { isGreenish, isLightGreenish, isYellowish, isLightYellowish, isGreyish, isReddish, isBlueish } from './colorValidators.js';
import { enderecoSelectors } from '../../src/data/enderecoSelectors.js';
import { translate, translateCountry, translateSubdivision } from './translate.js';


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
    // Prüfe dass keine endereco-Färbung vorhanden ist
    expect(isLightGreenish(bgColor)).toBeFalsy();
    expect(isLightYellowish(bgColor)).toBeFalsy();
    expect(isGreenish(borderBottomColor)).toBeFalsy();
    expect(isYellowish(borderBottomColor)).toBeFalsy();
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

export async function validateAddressState(page, addressSelector, colorArr, splitStreet) {
  const countrySelect = page.locator(addressSelector.country);
  const subdivisionSelect = page.locator(addressSelector.subdivision);
  const zipCodeInput = page.locator(addressSelector.zipCode);
  const cityInput = page.locator(addressSelector.city);
  const streetInput = page.locator(addressSelector.street);
  const houseNumberInput = page.locator(addressSelector.houseNumber);
  const streetFullInput = page.locator(addressSelector.streetFull);
  const additionalInfo = page.locator(addressSelector.additionalInfo);
  
  await validateFieldState(page, countrySelect, [], colorArr[0]);
  await validateFieldState(page, subdivisionSelect, [], colorArr[1]);
  await validateFieldState(page, zipCodeInput, [], colorArr[2]);
  await validateFieldState(page, cityInput, [], colorArr[3]);
  if (splitStreet) {
    await validateFieldState(page, streetInput, [], colorArr[4]);
    await validateFieldState(page, houseNumberInput, [], colorArr[5]);
  } else {
    await validateFieldState(page, streetFullInput, [], colorArr[6]);
  }
  await validateFieldState(page, additionalInfo, [], colorArr[7]);
  await page.waitForTimeout(500);
}

export async function validateAddressValues(page, addressSelector, expectedValues, splitStreet) {
  const countrySelect = page.locator(addressSelector.country);
  const subdivisionSelect = page.locator(addressSelector.subdivision);
  const zipCodeInput = page.locator(addressSelector.zipCode);
  const cityInput = page.locator(addressSelector.city);
  const streetInput = page.locator(addressSelector.street);
  const houseNumberInput = page.locator(addressSelector.houseNumber);
  const streetFullInput = page.locator(addressSelector.streetFull);
  const additionalInfo = page.locator(addressSelector.additionalInfo);

  
  const selectedCountry = countrySelect.locator('option:checked');
  await expect(selectedCountry).toHaveText(translateCountry(expectedValues.countryCode));

  const selectedSubdivision = subdivisionSelect.locator('option:checked');
  await expect(selectedSubdivision).toHaveText(translateSubdivision(expectedValues.subdivisionCode));
  
  await expect(zipCodeInput).toHaveValue(expectedValues.postCode);
  await expect(cityInput).toHaveValue(expectedValues.city);
  
  if (splitStreet) {
    await expect(streetInput).toHaveValue(expectedValues.street);
    await expect(houseNumberInput).toHaveValue(expectedValues.houseNumber);
  } else {
    await expect(streetFullInput).toHaveValue(expectedValues.streetFull);
  }
  await expect(additionalInfo).toHaveValue(expectedValues.additionalInfo);
}
