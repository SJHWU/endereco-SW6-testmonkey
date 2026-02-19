import { expect } from '@playwright/test';

import { translateCountry, translateSubdivision } from './translate.js';
import { getPluginConfig } from './getPluginConfig.js';

export async function fillAndWait(page, locator, value, waitTime = 3000) {
  await locator.fill(value);
  await locator.blur();
  await page.waitForTimeout(waitTime);
}

export async function fillAddressAndWait(page, addressSelector, variant, splitStreet, waitTime = 3000) {

  const countrySelect = page.locator(addressSelector.country);
  const subdivisionSelect = page.locator(addressSelector.subdivision);
  const zipCodeInput = page.locator(addressSelector.zipCode);
  const cityInput = page.locator(addressSelector.city);
  const streetInput = page.locator(addressSelector.street);
  const houseNumberInput = page.locator(addressSelector.houseNumber);
  const streetFullInput = page.locator(addressSelector.streetFull);
  const additionalInfo = page.locator(addressSelector.additionalInfo);
  
  await expect(countrySelect).toBeVisible();
  await expect(subdivisionSelect).toBeVisible(); 
  await expect(zipCodeInput).toBeVisible();
  await expect(cityInput).toBeVisible();
  if (splitStreet) {
    await expect(streetInput).toBeVisible();
    await expect(houseNumberInput).toBeVisible();
  } else {
    await expect(streetFullInput).toBeVisible();
  }
  await expect(additionalInfo).toBeVisible();
 
  await countrySelect.selectOption({ label: translateCountry(variant.countryCode) });
  
  await page.waitForTimeout(500);
  console.log('Wähle Subdivision:', translateSubdivision(variant.subdivisionCode));
  await subdivisionSelect.selectOption({ label: translateSubdivision(variant.subdivisionCode) });
  

  await zipCodeInput.fill(variant.postCode);
  await cityInput.fill(variant.city);

  if (splitStreet) {
    await streetInput.fill(variant.street);
    await houseNumberInput.fill(variant.houseNumber);
    await houseNumberInput.blur();
  } else {
    await streetFullInput.fill(variant.streetFull);
    await streetFullInput.blur();
  }
  await additionalInfo.fill(variant.additionalInfo);
  await additionalInfo.blur();
  await page.waitForTimeout(waitTime);
}
