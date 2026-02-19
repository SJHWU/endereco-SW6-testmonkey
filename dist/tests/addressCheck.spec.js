import 'dotenv/config';
import { test, expect } from '@playwright/test';

import { validOriginalVariants, almostPerfectVariants, minorCorrectionVariants } from '../src/generators/address-testData-builder.js';

import { fillCart } from './helpers/fillCart.js';
import { fillFormGuest } from './helpers/fillFormGuest.js';
import { fillAndWait, fillAddressAndWait } from './helpers/fillFields.js';
import { clearAndValidate, clearAddressAndValidate } from './helpers/clearAndValidate.js';
import { setupOtherInputField, validateOtherInputField } from './helpers/otherInputField.js';
import { validateFieldState, validateAddressState, validateAddressValues } from './helpers/fieldValidators.js';
import { accessWidgetCheckout } from './helpers/accessWidgetCheckout.js';
import { acceptCookies } from './helpers/acceptCookies.js';
import { createAccountAPI, loginAccount, navigateAccount } from './helpers/manageAccount.js';
import { setPluginConfig } from './helpers/setPluginConfig.js';
import { getPluginConfig } from './helpers/getPluginConfig.js';
import { setStandardConfig } from './helpers/setStandardConfig.js';
import { translate, translateCountry, translateSubdivision } from './helpers/translate.js';
import { useSelectedAddress, confirmOriginalInput, validateEnderecoModal } from './helpers/enderecoModal.js';
import * as inputSelectors from '../src/data/inputSelectors.js';
import { enderecoSelectors } from '../src/data/enderecoSelectors.js';
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
  { pathName: 'Adresse bearbeiten im Kundenkonto', path: ACCOUNT_ADDRESS_URL, addressSelectors: [inputSelectors.accountAddress.address] },
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
         'enderecoPhsActive': false,
         'enderecoAddressInputAssistantActive': true
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

          if (pathName.includes('als Gast')) {
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

    
    // 1) Gültige Original-Adressen ohne Korrekturen
    for (const splitStreet of [false, true]) {
      test.describe(`1${splitStreet ? 'b' : 'a'}) Gültige Original-Adressen ohne Korrekturen, ${splitStreet ? 'splitStreet = true' : 'splitStreet = false'}`, () => {
        test.beforeAll(async () => {
          await setPluginConfig({
            'enderecoAmsActive': true,
            'enderecoSplitStreetAndHouseNumber': splitStreet
          });
        });

        for (const variant of validOriginalVariants) {
          for (const addressSelector of addressSelectors) {
            test(`${pathName} | ${addressSelector.zipCode} | gültig | ${splitStreet ? 'splitStreet = true' : 'splitStreet = false'} | ${variant.category} | ${variant.postCode} ${variant.city} ${variant.baseData.street}`, async ({ page }) => {
              const enderecoModal = page.locator(enderecoSelectors.modal);
              const hasAddInfo = variant.baseData.additionalInfo.trim() !== '';

              if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
                await checkDifferentShippingAddress(page);
              }

              if (pathName.includes('Adresse bearbeiten')) {
                if (pathName.includes('als Gast')) {
                  await validateAddressState(page, addressSelector, ['green', 'green', 'green', 'green', 'green', 'green', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
                }
                await clearAddressAndValidate(page, addressSelector, splitStreet);
              }

              await fillAddressAndWait(page, addressSelector, variant, splitStreet);

              await validateAddressState(page, addressSelector, ['green', 'green', 'green', 'green', 'green', 'green', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
              await validateAddressValues(page, addressSelector, variant.baseData, splitStreet);
              await expect(enderecoModal).not.toBeVisible();

              await clearAddressAndValidate(page, addressSelector, splitStreet);
              await expect(enderecoModal).not.toBeVisible();
            });
          }
        }
      });
    } 

    // 2) Almost Perfect (Hausnummer vor Straße)
    for (const splitStreet of [false, true]) {
      test.describe(`2${splitStreet ? 'b' : 'a'}) Almost Perfect, ${splitStreet ? 'splitStreet = true' : 'splitStreet = false'}`, () => {
        test.beforeAll(async () => {
          await setPluginConfig({
            'enderecoAmsActive': true,
            'enderecoSplitStreetAndHouseNumber': splitStreet
          });
        });

        for (const variant of almostPerfectVariants) {
          for (const addressSelector of addressSelectors) {
            test(`${pathName} | ${addressSelector.zipCode} | almost perfect | ${splitStreet} | ${variant.category} | ${variant.postCode} ${variant.city} ${variant.baseData.street}`, async ({ page }) => {
              const enderecoModal = page.locator(enderecoSelectors.modal);
              const hasAddInfo = variant.baseData.additionalInfo.trim() !== '';

              if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
                await checkDifferentShippingAddress(page);
              }

              if (pathName.includes('Adresse bearbeiten')) {
                if (pathName.includes('als Gast')) {
                  await validateAddressState(page, addressSelector, ['green', 'green', 'green', 'green', 'green', 'green', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
                }
                await clearAddressAndValidate(page, addressSelector, splitStreet);
              }

              await fillAddressAndWait(page, addressSelector, variant, splitStreet);

              // erste Eingabe wird automatisch korrigiert, kein modal
              await validateAddressState(page, addressSelector, ['green', 'green', 'green', 'green', 'green', 'green', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
              await validateAddressValues(page, addressSelector, variant.baseData, splitStreet);
              await expect(enderecoModal).not.toBeVisible();

              // zweite Eingabe mit Bundesland bleibt stehen ohne Modal
              await fillAddressAndWait(page, addressSelector, variant, splitStreet);
              if (splitStreet) {
                await validateAddressState(page, addressSelector, ['green', 'green', 'green', 'green', 'green', 'none', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
              } else {
                await validateAddressState(page, addressSelector, ['green', 'green', 'green', 'green', 'green', 'green', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
              }
              await validateAddressValues(page, addressSelector, variant, splitStreet);
              await expect(enderecoModal).not.toBeVisible();

              await clearAddressAndValidate(page, addressSelector, splitStreet);
              await expect(enderecoModal).not.toBeVisible();
            });
          }
        }
      });
    }  
  
    // 3) Minor Corrections
    for (const splitStreet of [false, true]) {
      test.describe(`3${splitStreet ? 'b' : 'a'}) Minor Corrections, ${splitStreet ? 'splitStreet = true' : 'splitStreet = false'}`, () => {
        test.beforeAll(async () => {
          await setPluginConfig({
            'enderecoAmsActive': true,
            'enderecoSplitStreetAndHouseNumber': splitStreet,
            'enderecoAllowCloseIcon': true,
            'enderecoConfirmWithCheckbox': true
          });
        });

        for (const variant of minorCorrectionVariants) {
          for (const addressSelector of addressSelectors) {
            test(`${pathName} | ${addressSelector.zipCode} | minor correction | ${splitStreet} | ${variant.category} | ${variant.postCode} ${variant.city} ${variant.baseData.street}`, async ({ page }) => {
              const enderecoModal = page.locator(enderecoSelectors.modal);
              const hasAddInfo = variant.baseData.additionalInfo.trim() !== '';
              let formType = 'general';

              if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
                await checkDifferentShippingAddress(page);
                formType = addressSelector.zipCode.toLowerCase().includes('billing') ? 'billing' : 'shipping';
              }

              if (pathName.includes('Adresse bearbeiten')) {
                if (pathName.includes('als Gast')) {
                  await validateAddressState(page, addressSelector, ['green', 'green', 'green', 'green', 'green', 'green', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
                }
                await clearAddressAndValidate(page, addressSelector, splitStreet);
              }

              await fillAddressAndWait(page, addressSelector, variant, splitStreet);

              // erste Eingabe wird automatisch korrigiert, kein modal
              await validateAddressState(page, addressSelector, ['green', 'green', 'green', 'green', 'green', 'green', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
              await validateAddressValues(page, addressSelector, variant.baseData, splitStreet);
              await expect(enderecoModal).not.toBeVisible();

              // zweite Eingabe wird nicht automatisch korrigiert, und löst modal aus
              await fillAddressAndWait(page, addressSelector, variant, splitStreet);
              
              await validateEnderecoModal(page, enderecoModal, true, variant, formType);

              // Übernahme des Korrekturvorschlags im Modal (muss ausgewählt sein)
              await useSelectedAddress(page, enderecoModal);

              // validieren, dass die Adresse entsprechend der Korrekturvorschläge korrigiert wurde
              await validateAddressState(page, addressSelector, ['green', 'green', 'green', 'green', 'green', 'green', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
              await validateAddressValues(page, addressSelector, variant.baseData, splitStreet);
              await clearAddressAndValidate(page, addressSelector, splitStreet);

              // dritte Eingabe der fehlerhaften Adreese
              await fillAddressAndWait(page, addressSelector, variant, splitStreet);
              await validateEnderecoModal(page, enderecoModal, true, variant, formType);

              // bestätigen der fehlerhaften Eingabe im Modal
              await confirmOriginalInput(page, enderecoModal, true);

              // validieren des Status der Adressfelder nach Bestätigung der fehlerhaften Adresse
              switch (variant.category) {
                case 'typo-in-street':
                  console.log('typo-in-street');
                  await validateAddressState(page, addressSelector, ['green', 'green', 'green', 'green', 'yellow', 'green', 'yellow', hasAddInfo ? 'green' : 'none'], splitStreet);
                  break;
                case 'wrong-subdivision':
                case 'original-no-subdivision':
                  await validateAddressState(page, addressSelector, ['green', 'yellow', 'green', 'green', 'green', 'green', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
                  break;
                case 'house-number-before-street-no-subdivision':
                  await validateAddressState(page, addressSelector, ['green', 'yellow', 'green', 'green', 'green', 'none', 'green', hasAddInfo ? 'green' : 'none'], splitStreet);
                  break;
              }

              // validieren, dass die fehlerhaften Werte übernommen wurden
              await validateAddressValues(page, addressSelector, variant, splitStreet);
              await clearAddressAndValidate(page, addressSelector, splitStreet);

            });
          }
        }
      });
    }

  });
}

test.afterAll(async () => {
  console.log('Starte globalen Cleanup...');
  await setStandardConfig();
  await createAccountAPI(); 
});
