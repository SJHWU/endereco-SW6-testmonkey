import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { fillCart } from './helpers/fillCart.js';
import { fillFormGuest } from './helpers/fillFormGuest.js';
import { accessWidgetCheckout } from './helpers/accessWidgetCheckout.js';
import { fillAndWait } from './helpers/fillField.js';
import { validateFieldState } from './helpers/fieldValidators.js';
import { phoneCorrection } from './helpers/corrections.js';
import { setupOtherInputField, validateOtherInputField } from './helpers/otherInputField.js';
import { clearPrefilledInputField } from './helpers/editInputField.js';
import { validVariants, invalidVariants, validLandlineVariants, validMobileVariants, oneOfEach, oneValidOfEachType } from '../src/generators/phone-testData-builder.js';
import { acceptCookies } from './helpers/acceptCookies.js';
import { createAccount, loginAccount } from './helpers/manageAccount.js';
import { setPluginConfig } from './helpers/setPluginConfig.js';
import { translate } from './helpers/translate.js';
import * as inputSelectors from './helpers/inputSelectors.js';

const { BASE_URL, ACCOUNT_LOGIN_URL, CHECKOUT_REGISTER_URL, CHECKOUT_CONFIRM_URL, ACCOUNT_ADDRESS_URL } = process.env;

// URL-Pfade für die verschiedenen Test-Locations
const testPaths = [
  { pathName: 'Registrierung', path: ACCOUNT_LOGIN_URL, phoneSelectors: [inputSelectors.accountLogin.billing.phone, inputSelectors.accountLogin.shipping.phone] },
  { pathName: 'Gastbestellung', path: CHECKOUT_REGISTER_URL, phoneSelectors: [inputSelectors.checkoutRegister.billing.phone, inputSelectors.checkoutRegister.shipping.phone] },
  { pathName: 'neue Adresse im Checkout als Gast', path: CHECKOUT_CONFIRM_URL, phoneSelectors: [inputSelectors.checkoutConfirm.phone] },
  { pathName: 'Adresse bearbeiten im Checkout als Gast', path: CHECKOUT_CONFIRM_URL, phoneSelectors: [inputSelectors.checkoutConfirm.phone] },
  // { pathName: 'neue Adresse im Checkout als Kunde', path: CHECKOUT_CONFIRM_URL, phoneSelectors: [inputSelectors.checkoutConfirm.phone] },
  // { pathName: 'Adresse bearbeiten im Checkout als Kunde', path: CHECKOUT_CONFIRM_URL, phoneSelectors: [inputSelectors.checkoutConfirm.phone] },
  // { pathName: 'neue Adresse im Kundenkonto', path: ACCOUNT_ADDRESS_URL, phoneSelectors: [inputSelectors.accountAddress.phone] },
  // { pathName: 'Adresse bearbeiten im Kundenkonto', path: ACCOUNT_ADDRESS_URL, phoneSelectors: [inputSelectors.accountAddress.phone] }
];

// Mögliche Formate
const formats = ['E164', 'NATIONAL', 'INTERNATIONAL'];

// Sicherstellen, dass mindestens ein gültiger Eintrag für Mobilfunk und Festnetz vorhanden ist
if (!validLandlineVariants.length) {
  throw new Error('Es wurde kein gültiger Festnetz-Variantendatensatz gefunden, der für die Tests verwendet werden könnte. Bitte stelle sicher, dass der phone-baseData.json Datensatz mind. einen Eintrag für Festnetznummern enthält.');
}
if (!validMobileVariants.length) {
  throw new Error('Es wurde kein gültiger Mobilfunk-Variantendatensatz gefunden, der für die Tests verwendet werden könnte. Bitte stelle sicher, dass der phone-baseData.json Datensatz mind. einen Eintrag für Mobilnummern enthält.');
}


// Für jeden Pfad werden alle Phone-Tests durchgeführt
for (const { pathName, path, phoneSelectors } of testPaths) {
  test.describe(`Phone Validation auf ${pathName} (${path})`, () => {
    const fullUrl = BASE_URL + path;

    test.beforeEach(async ({ page }) => { 
      switch (path) {
        case ACCOUNT_LOGIN_URL:
          await page.goto(fullUrl, { waitUntil: 'networkidle' });
          await acceptCookies(page);
          break;
        case CHECKOUT_REGISTER_URL:
          await fillCart(page);
          break;
        case CHECKOUT_CONFIRM_URL:
          await fillCart(page);
          await fillFormGuest(page);
          if (pathName.includes('Adresse bearbeiten')) {
            await accessWidgetCheckout(page, true);
          } else {
            await accessWidgetCheckout(page, false);
          }
          await page.waitForTimeout(2500);
          break;
        case ACCOUNT_ADDRESS_URL:
          await page.goto(fullUrl, { waitUntil: 'networkidle' });
          await acceptCookies(page);
          break;
      }
    });

    // 1a) Gültige Telefonnummern, alle Formate akzeptiert, Mobil- und Festnetznummern, mit Statusmeldungen
    test.describe('1a) Gültige Telefonnummern, alle Formate, Mobil- und Festnetznummern, mit Statusmeldungen', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoPhsActive': true,
          'enderecoPhsDefaultFieldType': 'general',
          'enderecoPhsUseFormat': 'all',
          'enderecoShowPhoneErrors': true
        });
      });

      for (const variant of validVariants) {
        for (const selector of phoneSelectors) {
          test(`${pathName} | ${selector} | gültig | ${variant.category} | ${variant.raw}`, async ({ page }) => {
            let otherPhoneInput;
            if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
              otherPhoneInput = await setupOtherInputField(page, phoneSelectors, selector);
            }
            
            const phoneInput = page.locator(selector);
            await expect(phoneInput).toBeVisible();

            if (pathName.includes('Adresse bearbeiten')) {
              await clearPrefilledInputField(page, phoneInput, 'green');
            }

            await fillAndWait(page, phoneInput, variant.raw);
            
            await validateFieldState(page, phoneInput, false, [], 'green');
            await expect(phoneInput).toHaveValue(variant.raw);

            if (otherPhoneInput) {
              await validateOtherInputField(page, otherPhoneInput);
            }
          });
        }
      }
    });

    // 1b) Ungültige Telefonnummern, alle Formate, Mobil- und Festnetznummern, mit Statusmeldungen
    test.describe('1b) Ungültige Telefonnummern, alle Formate, Mobil- und Festnetznummern, mit Statusmeldungen', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoPhsActive': true,
          'enderecoPhsDefaultFieldType': 'general',
          'enderecoPhsUseFormat': 'all',
          'enderecoShowPhoneErrors': true
        });
      });

      for (const variant of invalidVariants) {
        for (const selector of phoneSelectors) {
          test(`${pathName} | ${selector} | ungültig | ${variant.category} | ${variant.raw}`, async ({ page }) => {
            let otherPhoneInput;
            if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
              otherPhoneInput = await setupOtherInputField(page, phoneSelectors, selector);
            }
        
            const phoneInput = page.locator(selector);
            await expect(phoneInput).toBeVisible();            

            if (pathName.includes('Adresse bearbeiten')) {
              await clearPrefilledInputField(page, phoneInput, 'green');
            }

            await fillAndWait(page, phoneInput, variant.raw);

            const invalidText = translate('enderecoshopware6client:statuses:phone_invalid');
            await validateFieldState(page, phoneInput, true, [invalidText], 'yellow');
            await expect(phoneInput).toHaveValue(variant.raw);

            // Korrigiere die Telefonnummer und validiere grüne Färbung und verschwinden der Fehlermeldungen
            await phoneCorrection(page, phoneInput, validVariants[0].raw);
            await expect(phoneInput).toHaveValue(validVariants[0].raw);

            if (otherPhoneInput) {
              await validateOtherInputField(page, otherPhoneInput);
            }
          });
        }
      }
    }); 

    // 2a) Gültige Telefonnummern, alle Formate, nur Mobilnummern, mit Statusmeldungen
    test.describe('2a) Gültige Telefonnummern, alle Formate, nur Mobilnummern, mit Statusmeldungen', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoPhsActive': true,
          'enderecoPhsDefaultFieldType': 'mobile',
          'enderecoPhsUseFormat': 'all',
          'enderecoShowPhoneErrors': true
        });
      });

      for (const variant of oneValidOfEachType) {
        for (const selector of phoneSelectors) {
          test(`${pathName} | ${selector} | gültig | ${variant.category} | ${variant.raw}`, async ({ page }) => {
            let otherPhoneInput;
            if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
              otherPhoneInput = await setupOtherInputField(page, phoneSelectors, selector);
            }
            const phoneInput = page.locator(selector);
            await expect(phoneInput).toBeVisible();

            if (pathName.includes('Adresse bearbeiten')) {
              await clearPrefilledInputField(page, phoneInput, 'green');
            }

            await fillAndWait(page, phoneInput, variant.raw);

            if (variant.type === 'mobile') {
              await validateFieldState(page, phoneInput, false, [], 'green');
              await expect(phoneInput).toHaveValue(variant.raw);
            } else {
              const shouldBeMobileText = translate('enderecoshopware6client:statuses:phone_should_be_mobile');
              await validateFieldState(page, phoneInput, true, [shouldBeMobileText], 'yellow');
              await expect(phoneInput).toHaveValue(variant.raw);

              await phoneCorrection(page, phoneInput, validMobileVariants[0].raw);
              await expect(phoneInput).toHaveValue(validMobileVariants[0].raw);
            }

            if (otherPhoneInput) {
              await validateOtherInputField(page, otherPhoneInput);
            }
          });
        }
      }
    }); 

    // 2b) Ungültige Telefonnummern, alle Formate, nur Mobilnummern, mit Statusmeldungen
    test.describe('2b) Ungültige Telefonnummern, alle Formate, nur Mobilnummern, mit Statusmeldungen', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoPhsActive': true,
          'enderecoPhsDefaultFieldType': 'mobile',
          'enderecoPhsUseFormat': 'all',
          'enderecoShowPhoneErrors': true
        });
      });

      for (const variant of invalidVariants) {
        for (const selector of phoneSelectors) {
          test(`${pathName} | ${selector} | ungültig | ${variant.category} | ${variant.raw}`, async ({ page }) => {
            let otherPhoneInput;
            if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
              otherPhoneInput = await setupOtherInputField(page, phoneSelectors, selector);
            }
           
            const phoneInput = page.locator(selector);
            await expect(phoneInput).toBeVisible();

            if (pathName.includes('Adresse bearbeiten')) {
              await clearPrefilledInputField(page, phoneInput, 'green');
            }

            await fillAndWait(page, phoneInput, variant.raw);

            const invalidText = translate('enderecoshopware6client:statuses:phone_invalid');
            const shouldBeMobileText = translate('enderecoshopware6client:statuses:phone_should_be_mobile');

            await validateFieldState(page, phoneInput, true, [invalidText, shouldBeMobileText], 'yellow');
            await expect(phoneInput).toHaveValue(variant.raw);
          
            await phoneCorrection(page, phoneInput, validMobileVariants[0].raw);
            await expect(phoneInput).toHaveValue(validMobileVariants[0].raw);

            if (otherPhoneInput) {
              await validateOtherInputField(page, otherPhoneInput);
            }
          });
        }
      }
    });

    // 3a) Gültige Telefonnummern, alle Formate, nur Festnetznummern, mit Statusmeldungen
    test.describe('3a) Gültige Telefonnummern, alle Formate, nur Festnetznummern, mit Statusmeldungen', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoPhsActive': true,
          'enderecoPhsDefaultFieldType': 'fixedLine',
          'enderecoPhsUseFormat': 'all',
          'enderecoShowPhoneErrors': true
        });
      });

      for (const variant of oneValidOfEachType) {
        for (const selector of phoneSelectors) {
          test(`${pathName} | ${selector} | gültig (Festnetz) | ${variant.category} | ${variant.raw}`, async ({ page }) => {
            let otherPhoneInput;
            if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
              otherPhoneInput = await setupOtherInputField(page, phoneSelectors, selector);
            }
            const phoneInput = page.locator(selector);
            await expect(phoneInput).toBeVisible();

            if (pathName.includes('Adresse bearbeiten')) {
              await clearPrefilledInputField(page, phoneInput, 'green');
            }

            await fillAndWait(page, phoneInput, variant.raw);

            if (variant.type === 'landline') {
              await validateFieldState(page, phoneInput, false, [], 'green');
              await expect(phoneInput).toHaveValue(variant.raw);
            } else {
              const shouldBeLandLineText = translate('enderecoshopware6client:statuses:phone_should_be_fixed');
              await validateFieldState(page, phoneInput, true, [shouldBeLandLineText], 'yellow');
              await expect(phoneInput).toHaveValue(variant.raw);

              await phoneCorrection(page, phoneInput, validLandlineVariants[0].raw);
              await expect(phoneInput).toHaveValue(validLandlineVariants[0].raw);
            }

            if (otherPhoneInput) {
              await validateOtherInputField(page, otherPhoneInput);
            }
          });
        }
      }
    }); 

    // 3b) Ungültige Telefonnummern, alle Formate, nur Festnetznummern, mit Statusmeldungen
    test.describe('3b) Ungültige Telefonnummern, alle Formate, nur Festnetznummern, mit Statusmeldungen', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoPhsActive': true,
          'enderecoPhsDefaultFieldType': 'fixedLine',
          'enderecoPhsUseFormat': 'all',
          'enderecoShowPhoneErrors': true
        });
      });

      for (const variant of invalidVariants) {
        for (const selector of phoneSelectors) {
          test(`${pathName} | ${selector} | ungültig (Festnetz) | ${variant.category} | ${variant.raw}`, async ({ page }) => {
            let otherPhoneInput;
            if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
              otherPhoneInput = await setupOtherInputField(page, phoneSelectors, selector);
            }
            
            const phoneInput = page.locator(selector);
            await expect(phoneInput).toBeVisible();

            if (pathName.includes('Adresse bearbeiten')) {
              await clearPrefilledInputField(page, phoneInput, 'green');
            }

            await fillAndWait(page, phoneInput, variant.raw);

            const invalidText = translate('enderecoshopware6client:statuses:phone_invalid');
            const shouldBeLandLineText = translate('enderecoshopware6client:statuses:phone_should_be_fixed');
            await validateFieldState(page, phoneInput, true, [invalidText, shouldBeLandLineText], 'yellow');
            await expect(phoneInput).toHaveValue(variant.raw);

            await phoneCorrection(page, phoneInput, validLandlineVariants[0].raw);
            await expect(phoneInput).toHaveValue(validLandlineVariants[0].raw);

            if (otherPhoneInput) {
              await validateOtherInputField(page, otherPhoneInput);
            }
          });
        }
      }
    }); 

    // 4) Formatumwandlungen mit gültigen Mobilnummern in alle Zielformate
    for (const targetFormat of formats) {
      test.describe(`4) Formatumwandlung zu ${targetFormat} mit gültigen Nummern`, () => {
        test.beforeAll(async () => {
          await setPluginConfig({
            'enderecoPhsActive': true,
            'enderecoPhsDefaultFieldType': 'general',
            'enderecoPhsUseFormat': targetFormat,
            'enderecoShowPhoneErrors': true
          });
        });

        for (const variant of validMobileVariants) {
          for (const selector of phoneSelectors) {
            test(`${pathName} | ${selector} | gültig | ${variant.category} | Eingabe: ${variant.raw} | Ziel: ${targetFormat}`, async ({ page }) => {
              let otherPhoneInput;
              if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
                otherPhoneInput = await setupOtherInputField(page, phoneSelectors, selector);
              }
              const phoneInput = page.locator(selector);
              await expect(phoneInput).toBeVisible();

              const flagContainer = phoneInput.locator('xpath=../..').locator('.endereco-big-flag');
              const flagSvg = flagContainer.locator('.endereco-flag svg');
              const needsFlag = (targetFormat === 'E164' || targetFormat === 'INTERNATIONAL');
              
              if (pathName.includes('Adresse bearbeiten')) {
                await clearPrefilledInputField(page, phoneInput, 'green');
              }

              if (needsFlag) {
                await expect(flagContainer).toBeVisible();
                await expect(flagSvg).toHaveAttribute('fill', 'none');
              }
               
              await fillAndWait(page, phoneInput, variant.raw);

              if (needsFlag) {
                await expect(flagContainer).toBeVisible();
                await expect(flagSvg).not.toHaveAttribute('fill', 'none');
              }

              // Nach Formatumwandlung soll die Anzeige der Telefonnummer dem targetFormat entsprechen
              await expect(phoneInput).toHaveValue(variant.formats[targetFormat]);

              await validateFieldState(page, phoneInput, false, [], 'green');

              if (otherPhoneInput) {
                await validateOtherInputField(page, otherPhoneInput);
              }
            });
          }
        }
      });
    } 

    // 5) Statusmeldungen unterhalb des Telefonnummer-Eingabefeldes deaktivieren
    test.describe('5) Statusmeldungen unterhalb des Telefonnummer-Eingabefeldes deaktivieren', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoPhsActive': true,
          'enderecoPhsDefaultFieldType': 'general',
          'enderecoPhsUseFormat': 'all',
          'enderecoShowPhoneErrors': false
        });
      });

      for (const variant of oneOfEach) {
        for (const selector of phoneSelectors) {
          test(`${pathName} | ${selector} | ${variant.category} | ${variant.raw} | sollte keine Statusmeldungen anzeigen`, async ({ page }) => {
            let otherPhoneInput;
            if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
              otherPhoneInput = await setupOtherInputField(page, phoneSelectors, selector);
            }

            // Telefonnummer eingeben
            const phoneInput = page.locator(selector);
            await expect(phoneInput).toBeVisible();

            if (pathName.includes('Adresse bearbeiten')) {
              await clearPrefilledInputField(page, phoneInput, 'green');
            } 

            await fillAndWait(page, phoneInput, variant.raw);

            // Erwartung: keine Statusmeldungen, aber Färbung
            const expectedColor = variant.isValid ? 'green' : 'yellow';
            await validateFieldState(page, phoneInput, false, [], expectedColor);

            if (otherPhoneInput) {
              await validateOtherInputField(page, otherPhoneInput);
            }
          });
        }
      }
    });

    // 6) Rufnummernprüfung komplett deaktivieren
    test.describe('6) Rufnummernprüfung komplett deaktivieren', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoPhsActive': false,
          'enderecoPhsDefaultFieldType': 'general',
          'enderecoPhsUseFormat': 'all',
          'enderecoShowPhoneErrors': false
        });
      });

      for (const variant of oneOfEach) {
        for (const selector of phoneSelectors) {
          test(`${pathName} | ${selector} | ${variant.category} | ${variant.raw} | sollte keine Statusmeldungen und keine Einfärbungen anzeigen`, async ({ page }) => {
            let otherPhoneInput;
            if (pathName === 'Registrierung' || pathName === 'Gastbestellung') {
              otherPhoneInput = await setupOtherInputField(page, phoneSelectors, selector);
            }

            // Telefonnummer eingeben
            const phoneInput = page.locator(selector);
            await expect(phoneInput).toBeVisible();

            if (pathName.includes('Adresse bearbeiten')) {
              await clearPrefilledInputField(page, phoneInput, 'none');
            }

            await fillAndWait(page, phoneInput, variant.raw);

            // Erwartung: keine Statusmeldungen und keine Einfärbungen
            await validateFieldState(page, phoneInput, false, [], 'none');

            if (otherPhoneInput) {
              await validateOtherInputField(page, otherPhoneInput);
            }
          });
        }
      }
    });
  });
}

test.describe('Cleanup', () => {
  test('Shop-Einstellungen zurücksetzen', async () => {
    await setPluginConfig({
      'enderecoPhsActive': true,
      'enderecoPhsDefaultFieldType': 'general',
      'enderecoPhsUseFormat': 'all',
      'enderecoShowPhoneErrors': true
    });
  });
});