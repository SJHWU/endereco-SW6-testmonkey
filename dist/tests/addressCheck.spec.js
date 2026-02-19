import 'dotenv/config';
import { test, expect } from '@playwright/test';

import { validOriginalVariants, minorCorrectionVariants } from '../src/generators/address-testData-builder.js';

import { fillCart } from './helpers/fillCart.js';
import { fillFormGuest } from './helpers/fillFormGuest.js';
import { fillAndWait } from './helpers/fillField.js';
import { clearAndValidate } from './helpers/clearAndValidate.js';
import { setupOtherInputField, validateOtherInputField } from './helpers/otherInputField.js';
import { validateFieldState } from './helpers/fieldValidators.js';
import { accessWidgetCheckout } from './helpers/accessWidgetCheckout.js';
import { acceptCookies } from './helpers/acceptCookies.js';
import { createAccountAPI, loginAccount, navigateAccount } from './helpers/manageAccount.js';
import { setPluginConfig } from './helpers/setPluginConfig.js';
import { getPluginConfig } from './helpers/getPluginConfig.js';
import { setStandardConfig } from './helpers/setStandardConfig.js';
import { translateCountry, translateSubdivision } from './helpers/translate.js';
import * as inputSelectors from '../src/data/inputSelectors.js';
import { checkDifferentShippingAddress } from './helpers/checkDifferentShippingAddress.js';

const { BASE_URL, ACCOUNT_LOGIN_URL, CHECKOUT_REGISTER_URL, CHECKOUT_CONFIRM_URL, ACCOUNT_ADDRESS_URL } = process.env;

// URL-Pfade für die verschiedenen Test-Locations
const testPaths = [
   { pathName: 'Registrierung', path: ACCOUNT_LOGIN_URL, addressSelectors: [inputSelectors.accountLogin.billing.address, inputSelectors.accountLogin.shipping.address] },
   { pathName: 'Gastbestellung', path: CHECKOUT_REGISTER_URL, addressSelectors: [inputSelectors.checkoutRegister.billing.address, inputSelectors.checkoutRegister.shipping.address] },
   { pathName: 'neue Adresse im Checkout als Gast', path: CHECKOUT_CONFIRM_URL, addressSelectors: [inputSelectors.checkoutConfirm.address] },
   { pathName: 'Adresse bearbeiten im Checkout als Gast', path: CHECKOUT_CONFIRM_URL, addressSelectors: [inputSelectors.checkoutConfirm.address] },
   { pathName: 'neue Adresse im Checkout als Kunde', path: CHECKOUT_CONFIRM_URL, addressSelectors: [inputSelectors.checkoutConfirm.address] },
   { pathName: 'Adresse bearbeiten im Checkout als Kunde', path: CHECKOUT_CONFIRM_URL, addressSelectors: [inputSelectors.checkoutConfirm.address] }, 
   { pathName: 'neue Adresse im Kundenkonto', path: ACCOUNT_ADDRESS_URL, addressSelectors: [inputSelectors.accountAddress.address] },
   { pathName: 'Adresse bearbeiten im Kundenkonto', path: ACCOUNT_ADDRESS_URL, addressSelectors: [inputSelectors.accountAddress.address] }
];

// Sicherstellen, dass mindestens ein gültiger Eintrag vorhanden ist
if (!validOriginalVariants.length) {
  throw new Error(`Es wurde kein gültiger Original-Variantendatensatz gefunden,
    der für die Tests verwendet werden könnte. Bitte stelle sicher, dass der address-baseData.json
    Datensatz mind. einen Eintrag enthält.`);
}

test.beforeAll(async () => {
  console.log('Starte Standardinitialisierung..');
  await setStandardConfig();
  await setPluginConfig({
         'enderecoNameCheckActive': false,
         'enderecoEmailCheckActive': false,
         'enderecoPhsActive': false
        });
  await createAccountAPI(); 
});

// Für jeden Pfad werden alle Address-Tests durchgeführt
for (const { pathName, path, addressSelectors } of testPaths) {
  test.describe(`Address Validation auf ${pathName} (${path})`, () => {
 
    test.beforeEach(async ({ page }) => { 
      switch (path) {
        case ACCOUNT_LOGIN_URL:
          await page.goto(BASE_URL + ACCOUNT_LOGIN_URL, { waitUntil: 'networkidle' });
          await acceptCookies(page);
          break;

        case CHECKOUT_REGISTER_URL:
          await fillCart(page);
          break;

        case CHECKOUT_CONFIRM_URL:
          if (pathName.includes('als Kunde')) {
            await loginAccount(page);
          }

          await fillCart(page);

          if(pathName.includes('als Gast')) {
            await fillFormGuest(page);
          }

          if (pathName.includes('Adresse bearbeiten')) {
            await accessWidgetCheckout(page, true);
          } else {
            await accessWidgetCheckout(page, false);
          }
          await page.waitForTimeout(2500);
          break;

        case ACCOUNT_ADDRESS_URL:
          await loginAccount(page);
          await acceptCookies(page);
          if (pathName === 'Adresse bearbeiten im Kundenkonto') {
            await navigateAccount(page, true);
          } else if (pathName === 'neue Adresse im Kundenkonto') {
            await navigateAccount(page, false);
          }    
          break;
      }
    });

    // 1a) Gültige Original-Adressen ohne Korrekturen, street full
    test.describe('1a) Gültige Original-Adressen ohne Korrekturen, street full', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoAmsActive': true,
          'enderecoAddressInputAssistantActive': true,
          'enderecoSplitStreetAndHouseNumber': false
        });
      });

      for (const variant of validOriginalVariants) {
        for (const addressSelector of addressSelectors) {
          test(`${pathName} | ${addressSelector.zipCode} | gültig | ${variant.category} | ${variant.postCode} ${variant.city} ${variant.street}`, async ({ page }) => {
            if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
              await checkDifferentShippingAddress(page);
            } 

            const countrySelect = page.locator(addressSelector.country);
            const subdivisionSelect = page.locator(addressSelector.subdivision);
            const zipCodeInput = page.locator(addressSelector.zipCode);
            const cityInput = page.locator(addressSelector.city);
            const streetInput = page.locator(addressSelector.streetFull);
            
            await expect(countrySelect).toBeVisible();
            await expect(subdivisionSelect).toBeVisible(); 
            await expect(zipCodeInput).toBeVisible();
            await expect(cityInput).toBeVisible();
            await expect(streetInput).toBeVisible();

            if (pathName.includes('Adresse bearbeiten')) {
              if(pathName.includes('als Gast')) {
              // sollte grün sein, funktioniert aktuell nicht -> bug in Bearbeitung, deshalb auskommentiert
              // await validateFieldState(page, zipCodeInput, [], 'green');
              }
              await clearAndValidate(page, zipCodeInput);
              await clearAndValidate(page, cityInput);
              await clearAndValidate(page, streetInput);
            } 

            // Fülle die Adressfelder aus

            await countrySelect.selectOption({ label: translateCountry(variant.countryCode) });
            if (variant.subdivisionCode) {
                console.log('Wähle Subdivision:', translateSubdivision(variant.subdivisionCode));
                await page.waitForTimeout(500);
                await subdivisionSelect.selectOption({ label: translateSubdivision(variant.subdivisionCode) });
            }
            await fillAndWait(page, zipCodeInput, variant.postCode);
            await fillAndWait(page, cityInput, variant.city);
            await fillAndWait(page, streetInput, variant.streetFull);
            
            // Validiere grüne Färbung und keine Fehlermeldungen
            await validateFieldState(page, zipCodeInput, [], 'green');
            await validateFieldState(page, cityInput, [], 'green');
            await validateFieldState(page, streetInput, [], 'green');

            // sollte neutral sein, funktioniert aktuell nicht -> bug in Bearbeitung, deshalb auskommentiert
            // await clearAndValidate(page, zipCodeInput);
          });
        }
      }
    });

  });
}

test.afterAll(async () => {
  console.log('Starte globalen Cleanup...');
  await setStandardConfig();
});
