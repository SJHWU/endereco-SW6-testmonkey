/**
 * Füllt das komplette Formular für Gastbestellung mit gültigen Daten
 * @param {import('@playwright/test').Page} page - Die Playwright Page-Instanz
 */
import 'dotenv/config';
import formData from '../../src/data/complete-formData.json' with { type: 'json' };
import { getPluginConfig } from './getPluginConfig';


const { BASE_URL, CHECKOUT_REGISTER_URL } = process.env;

export async function fillFormGuest(page) {
  console.log('Fülle Formular für Gastbestellung via UI');
  
  const fullUrl = `${BASE_URL}${CHECKOUT_REGISTER_URL}`;
  await page.goto(fullUrl);
  await page.waitForLoadState('networkidle'); 


  // Fülle die Felder mit den Testdaten
  await page.fill('#billingAddress-personalFirstName', formData.firstName);
  await page.fill('#billingAddress-personalLastName', formData.lastName);
  await page.fill('#personalMail', formData.email);
  await page.fill('#billingAddressAddressZipcode', formData.postCode); 
  
  await page.fill('#billingAddressAddressCity', formData.city);
 
  await page.fill('#billingAddress-AddressStreet', formData.streetFull);

  const requiredPhoneType = await getPluginConfig('enderecoPhsDefaultFieldType');
  const type = requiredPhoneType === 'mobile' ? 'phoneMobile' : 'phoneLandline';
  console.log('Erforderlicher Telefonnummerntyp laut Plugin-Konfiguration:', requiredPhoneType);
  await page.fill('#billingAddressAddressPhoneNumber', formData[type]);
  await page.locator('#billingAddressAddressCountry').selectOption({ label: formData.country });
  
  //Klicke auf das "Weiter"-Button, um zum nächsten Schritt zu gelangen
  const continueButton = page.locator('.register-submit button');
  await continueButton.waitFor({ state: 'visible', timeout: 5000 });
  await continueButton.click();

  await page.waitForLoadState('networkidle');
}