
import 'dotenv/config';
import { expect, test } from '@playwright/test';
import { validExistentVariants, validNonexistentVariants, invalidVariants, oneOfEach } from '../src/generators/eMail-testData-builder.js';
import { fillCart } from './helpers/fillCart.js';
import { fillAndWait } from './helpers/fillField.js';
import { validateFieldState } from './helpers/fieldValidators.js';
import { eMailCorrection } from './helpers/corrections.js';
import { setPluginConfig } from './helpers/setPluginConfig.js';
import { acceptCookies } from './helpers/acceptCookies.js';
import { translate } from './helpers/translate.js';
import { setApiConfig } from './helpers/setApiConfig.js';
import { clearAndValidate } from './helpers/clearAndValidate.js';
import * as inputSelectors from './helpers/inputSelectors.js';

const { BASE_URL, ACCOUNT_LOGIN_URL, CHECKOUT_REGISTER_URL } = process.env;

setApiConfig();

// URL-Pfade für die verschiedenen Test-Locations
const testPaths = [
 // { pathName: 'Registrierung', path: ACCOUNT_LOGIN_URL, eMailSelector: inputSelectors.accountLogin.billing.eMail },
  { pathName: 'Gastbestellung', path: CHECKOUT_REGISTER_URL, eMailSelector: inputSelectors.checkoutRegister.billing.eMail }
];

// Für jeden Pfad werden alle E-Mail-Tests durchgeführt
for (const { pathName, path, eMailSelector } of testPaths) {
  test.describe(`E-Mail Validation auf ${pathName} (${path})`, () => {
    const fullUrl = BASE_URL + path;

    test.beforeEach(async ({ page }) => {
      if (pathName === 'Gastbestellung') {
        await fillCart(page);
      } else {
        await page.goto(fullUrl, { waitUntil: 'networkidle' });
        await acceptCookies(page);
      }
    });

    // 1) Gültige und existierende E-Mails
    test.describe('1) Gültige und existierende E-Mails', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoEmailCheckActive': true,
          'enderecoShowEmailStatus': true
        });
      });

      for (const variant of validExistentVariants) {
        test(`${pathName} | ${eMailSelector} | gültig | ${variant.category} | ${variant.fullEmail}`, async ({ page }) => { 
          const emailInput = page.locator(eMailSelector);
          await expect(emailInput).toBeVisible();
          await fillAndWait(page, emailInput, variant.fullEmail);

          await validateFieldState(page, emailInput, false, [], 'green');

          await clearAndValidate(page, emailInput);
        });
      }
    });

    // 2) Syntaktisch gültige aber nicht existierende E-Mails
    test.describe('2) Syntaktisch gültige aber nicht existierende E-Mails', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoEmailCheckActive': true,
          'enderecoShowEmailStatus': true
        });
      });

      for (const variant of validNonexistentVariants) {
        test(`${pathName} | ${eMailSelector} | gültig-nicht-existierend | ${variant.category} | ${variant.fullEmail}`, async ({ page }) => {
          // E-Mail eingeben
          const emailInput = page.locator(eMailSelector);
          await expect(emailInput).toBeVisible();
          await fillAndWait(page, emailInput, variant.fullEmail);

          const notCorrectText = translate('enderecoshopware6client:statuses:email_not_correct');
          await validateFieldState(page, emailInput, true, [notCorrectText], 'yellow');

          // Korrigiere die E-Mail und validiere grüne Färbung und verschwinden der Fehlermeldungen (Endereco)
          await eMailCorrection(page, emailInput, validExistentVariants[0].fullEmail);

          await clearAndValidate(page, emailInput);
        });
      }
    });

    // 3) Syntaktisch ungültige E-Mails
    test.describe('3) Syntaktisch ungültige E-Mails', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoEmailCheckActive': true,
          'enderecoShowEmailStatus': true
        });
      });
      
      for (const variant of invalidVariants) {
        test(`${pathName} | ${eMailSelector} | ungültig | ${variant.category} | ${variant.fullEmail}`, async ({ page }) => {
          // E-Mail eingeben
          const emailInput = page.locator(eMailSelector);
          await expect(emailInput).toBeVisible();
          await fillAndWait(page, emailInput, variant.fullEmail);

          const notCorrectText = translate('enderecoshopware6client:statuses:email_not_correct');
          const syntaxErrorText = translate('enderecoshopware6client:statuses:email_syntax_error');
          await validateFieldState(page, emailInput, true, [notCorrectText, syntaxErrorText], 'yellow');

          // Korrigiere die E-Mail und validiere grüne Färbung und verschwinden der Fehlermeldungen (Endereco und Shopware)
          await eMailCorrection(page, emailInput, validExistentVariants[0].fullEmail);

          await clearAndValidate(page, emailInput);
        });
      }
    }); 

    // 4) Statusmeldungen unterhalb des E-Mail Eingabefeldes deaktivieren
    test.describe('4) Statusmeldungen unterhalb des E-Mail Eingabefeldes deaktivieren', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoEmailCheckActive': true,
          'enderecoShowEmailStatus': false
        });
      });

      for (const variant of oneOfEach) {
        test(`${pathName} | ${eMailSelector} | ${variant.category} | ${variant.fullEmail} | sollte keine Statusmeldungen anzeigen`, async ({ page }) => {
          // E-Mail eingeben
          const emailInput = page.locator(eMailSelector);
          await expect(emailInput).toBeVisible();
          await fillAndWait(page, emailInput, variant.fullEmail);

          await validateFieldState(page, emailInput, false, [], variant.isExistent ? 'green' : 'yellow');

          if (!variant.isExistent) {
            await eMailCorrection(page, emailInput, validExistentVariants[0].fullEmail);

            await clearAndValidate(page, emailInput);
          }
        });
      }
    });

    // 5) E-Mail Prüfung komplett deaktivieren
    test.describe('5) E-Mail Prüfung komplett deaktivieren', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoEmailCheckActive': false,
          'enderecoShowEmailStatus': false
        });
      });

      for (const variant of oneOfEach) {
        test(`${pathName} | ${eMailSelector} | ${variant.category} | ${variant.fullEmail} | sollte keine Statusmeldungen und keine Einfärbungen anzeigen`, async ({ page }) => {
          
          // E-Mail eingeben
          const emailInput = page.locator(eMailSelector);
          await expect(emailInput).toBeVisible();
          await fillAndWait(page, emailInput, variant.fullEmail);

          await validateFieldState(page, emailInput, false, [], 'none');

          await clearAndValidate(page, emailInput);
        });
      }
    });
  });
}

test.describe('Cleanup', () => {
  test('Shop-Einstellungen zurücksetzen', async () => {
    await setPluginConfig({
      'enderecoEmailCheckActive': true,
      'enderecoShowEmailStatus': true
    });
  });
});
