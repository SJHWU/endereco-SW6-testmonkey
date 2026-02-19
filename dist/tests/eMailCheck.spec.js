
import 'dotenv/config';
import { expect, test } from '@playwright/test';

import { validExistentVariants, validNonexistentVariants, invalidVariants, oneOfEach } from '../src/generators/eMail-testData-builder.js';

import { fillCart } from './helpers/fillCart.js';
import { fillAndWait } from './helpers/fillField.js';
import { clearAndValidate } from './helpers/clearAndValidate.js';
import { validateFieldState } from './helpers/fieldValidators.js';
import { eMailCorrection } from './helpers/corrections.js';
import { acceptCookies } from './helpers/acceptCookies.js';
import { setPluginConfig } from './helpers/setPluginConfig.js';
import { setStandardConfig } from './helpers/setStandardConfig.js';
import { translate } from './helpers/translate.js';
import * as inputSelectors from '../src/data/inputSelectors.js';

const { BASE_URL, ACCOUNT_LOGIN_URL, CHECKOUT_REGISTER_URL } = process.env;


// URL-Pfade für die verschiedenen Test-Locations
const testPaths = [
  { pathName: 'Gastbestellung', path: CHECKOUT_REGISTER_URL, eMailSelector: inputSelectors.checkoutRegister.billing.eMail },
  { pathName: 'Registrierung', path: ACCOUNT_LOGIN_URL, eMailSelector: inputSelectors.accountLogin.billing.eMail },
];


test.beforeAll(async () => {
  console.log('Starte Standardinitialisierung..');
  await setStandardConfig();
});

// Für jeden Pfad werden alle E-Mail-Tests durchgeführt
for (const { pathName, path, eMailSelector } of testPaths) {
  test.describe(`E-Mail Validation auf ${pathName} (${path})`, () => {
    const fullUrl = BASE_URL + path;
    
    test.beforeEach(async ({ page }) => {
      switch (path) {
        case CHECKOUT_REGISTER_URL:
          await fillCart(page);
          break;

        case ACCOUNT_LOGIN_URL:
          await page.goto(fullUrl, { waitUntil: 'networkidle' });
          await acceptCookies(page);
          break;
      }
    });

    // 1) Gültige und existierende E-Mails, mit Statusmeldungen
    test.describe('1) Gültige und existierende E-Mails, mit Statusmeldungen', () => {
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

          await validateFieldState(page, emailInput, [], 'green');

          await clearAndValidate(page, emailInput);
        });
      }
    });

    // 2) Syntaktisch gültige, aber nicht existierende E-Mails, mit Statusmeldungen
    test.describe('2) Syntaktisch gültige, aber nicht existierende E-Mails, mit Statusmeldungen', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoEmailCheckActive': true,
          'enderecoShowEmailStatus': true
        });
      });

      for (const variant of validNonexistentVariants) {
        test(`${pathName} | ${eMailSelector} | gültig-nicht-existierend | ${variant.category} | ${variant.fullEmail}`, async ({ page }) => {
          const emailInput = page.locator(eMailSelector);
          await expect(emailInput).toBeVisible();
          await fillAndWait(page, emailInput, variant.fullEmail);

          const notCorrectText = translate('enderecoshopware6client:statuses:email_not_correct');
          await validateFieldState(page, emailInput, [notCorrectText], 'yellow');

          await eMailCorrection(page, emailInput, validExistentVariants[0].fullEmail);

          await clearAndValidate(page, emailInput);
        });
      }
    });

    // 3) Syntaktisch ungültige E-Mails, mit Statusmeldungen
    test.describe('3) Syntaktisch ungültige E-Mails, mit Statusmeldungen', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoEmailCheckActive': true,
          'enderecoShowEmailStatus': true
        });
      });
      
      for (const variant of invalidVariants) {
        test(`${pathName} | ${eMailSelector} | ungültig | ${variant.category} | ${variant.fullEmail}`, async ({ page }) => {
          const emailInput = page.locator(eMailSelector);
          await expect(emailInput).toBeVisible();
          await fillAndWait(page, emailInput, variant.fullEmail);

          const notCorrectText = translate('enderecoshopware6client:statuses:email_not_correct');
          const syntaxErrorText = translate('enderecoshopware6client:statuses:email_syntax_error');
          await validateFieldState(page, emailInput, [notCorrectText, syntaxErrorText], 'yellow');

          await eMailCorrection(page, emailInput, validExistentVariants[0].fullEmail);

          await clearAndValidate(page, emailInput);
        });
      }
    }); 

    // 4) Gültige und ungültige E-Mails, ohne Statusmeldungen
    test.describe('4) Gültige und ungültige E-Mails, ohne Statusmeldungen', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoEmailCheckActive': true,
          'enderecoShowEmailStatus': false
        });
      });

      for (const variant of oneOfEach) {
        test(`${pathName} | ${eMailSelector} | ${variant.category} | ${variant.fullEmail} | sollte keine Statusmeldungen anzeigen`, async ({ page }) => {
          const emailInput = page.locator(eMailSelector);
          await expect(emailInput).toBeVisible();
          await fillAndWait(page, emailInput, variant.fullEmail);

          await validateFieldState(page, emailInput, [], variant.isExistent ? 'green' : 'yellow');

          if (!variant.isExistent) {
            await eMailCorrection(page, emailInput, validExistentVariants[0].fullEmail);
          }

          await clearAndValidate(page, emailInput);
        });
      }
    });

    // 5) E-Mail Prüfung deaktiviert
    test.describe('5) E-Mail Prüfung deaktiviert', () => {
      test.beforeAll(async () => {
        await setPluginConfig({
          'enderecoEmailCheckActive': false,
          'enderecoShowEmailStatus': false
        });
      });

      for (const variant of oneOfEach) {
        test(`${pathName} | ${eMailSelector} | ${variant.category} | ${variant.fullEmail} | sollte keine Statusmeldungen und keine Einfärbungen anzeigen`, async ({ page }) => {
          const emailInput = page.locator(eMailSelector);
          await expect(emailInput).toBeVisible();
          await fillAndWait(page, emailInput, variant.fullEmail);

          await validateFieldState(page, emailInput, [], 'none');

          await clearAndValidate(page, emailInput);
        });
      }
    });
  });
}

test.afterAll(async () => {
  console.log('Starte globalen Cleanup...');
  await setStandardConfig();
});