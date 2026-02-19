/**
 * Füllt das komplette Formular für Gastbestellung mit gültigen Daten
 * @param {import('@playwright/test').Page} page - Die Playwright Page-Instanz
 */
import 'dotenv/config';
import formData from '../../src/data/complete-formData.json' with { type: 'json' };
import * as inputSelectors from '../../src/data/inputSelectors.js';
import { getPluginConfig } from './getPluginConfig';
import { translate, translateCountry, translateSubdivision } from './translate.js';


const { BASE_URL, CHECKOUT_REGISTER_URL } = process.env;

export async function fillFormGuest(page) {
  console.log('Fülle Formular für Gastbestellung via UI');
  
  await page.goto(BASE_URL + CHECKOUT_REGISTER_URL);
  await page.waitForLoadState('networkidle'); 

  // Fülle die Felder mit den Testdaten
  await page.fill(inputSelectors.checkoutRegister.billing.firstName, formData.firstName);
  await page.fill(inputSelectors.checkoutRegister.billing.lastName, formData.lastName);

  await page.fill(inputSelectors.checkoutRegister.billing.eMail, formData.email);

  await page.locator(inputSelectors.checkoutRegister.billing.address.country).selectOption({ label: translateCountry(formData.countryCode) });
  await page.waitForTimeout(500);
  await page.locator(inputSelectors.checkoutRegister.billing.address.subdivision).selectOption({ label: translateSubdivision(formData.subdivisionCode) });
  await page.fill(inputSelectors.checkoutRegister.billing.address.zipCode, formData.postCode);
  await page.fill(inputSelectors.checkoutRegister.billing.address.city, formData.city);
  
  const splitStreet = await getPluginConfig('enderecoSplitStreetAndHouseNumber');
  if (splitStreet) {
    await page.fill(inputSelectors.checkoutRegister.billing.address.street, formData.street);
    await page.fill(inputSelectors.checkoutRegister.billing.address.houseNumber, formData.houseNumber);
  } else {
    await page.fill(inputSelectors.checkoutRegister.billing.address.streetFull, formData.streetFull);
  }
  
  const requiredPhoneType = await getPluginConfig('enderecoPhsDefaultFieldType');
  const type = requiredPhoneType === 'mobile' ? 'phoneMobile' : 'phoneLandline';
  console.log('Erforderlicher Telefonnummerntyp laut Plugin-Konfiguration:', requiredPhoneType);
  await page.fill(inputSelectors.checkoutRegister.billing.phone, formData[type]);

  
  //Klicke auf das "Weiter"-Button, um zum nächsten Schritt zu gelangen
  const continueButton = page.getByRole('button', { name: translate('account:registerSubmit') });
  await continueButton.waitFor({ state: 'visible', timeout: 5000 });
  await continueButton.click();

  await page.waitForLoadState('networkidle');
}