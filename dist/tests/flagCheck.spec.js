import 'dotenv/config';
import { test, expect } from '@playwright/test';

import flagMapping from '../src/data/flagMapping.json' with { type: 'json' };
import validNumbersAllCountries from '../src/data/validNumbersAllCountries.json' with { type: 'json' };
import * as inputSelectors from '../src/data/inputSelectors.js';
import { acceptCookies } from './helpers/acceptCookies.js';
import { setPluginConfig } from './helpers/setPluginConfig.js';
import { setStandardConfig } from './helpers/setStandardConfig.js';
import { fillAndWait } from './helpers/fillFields.js';
import { verifyFlag } from './helpers/verifyFlag.js';
import { validateFieldState } from './helpers/fieldValidators.js';

const { BASE_URL, ACCOUNT_LOGIN_URL } = process.env;

// Limitierung für Entwicklung/Testing - für Produktiv auf null setzen oder auskommentieren
// HLR lookup eventuell im API Key deaktivieren, um unnötige Kosten zu vermeiden.
const TEST_LIMIT = 10;
const testFlagMapping = TEST_LIMIT ? flagMapping.slice(0, TEST_LIMIT) : flagMapping;

test.describe('Flaggendarstellung Validierung', () => {
  test.describe.configure({ retries: 0 });
  

  test.beforeAll(async () => {
    console.log('Starte Standardinitialisierung..');
    await setStandardConfig();
    await setPluginConfig({
      'enderecoPhsActive': true,
      'enderecoPhsDefaultFieldType': 'general',
      'enderecoPhsUseFormat': 'E164',
      'enderecoShowPhoneErrors': true
    });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + ACCOUNT_LOGIN_URL, { waitUntil: 'networkidle' });
    await acceptCookies(page);
  });
  // 1) Flaggendarstellung für alle country codes vor API Call
  test('Validiere Flaggendarstellung für alle country codes VOR API Call', async ({ page }) => {

    const phoneInput = page.locator(inputSelectors.accountLogin.billing.phone);
    await expect(phoneInput).toBeVisible();

    const flagContainer = phoneInput.locator('xpath=..').locator('.endereco-flag');
    await expect(flagContainer).toBeVisible();

    const failedCountries = [];

    for (const { iso2, code } of testFlagMapping) {
      try {
        await phoneInput.fill(code);
        await page.waitForTimeout(100);
        await verifyFlag(flagContainer, iso2);
      } catch (error) {
        failedCountries.push({ iso2, code, error: error.message });
      }
    }

    if (failedCountries.length) {
      console.error('Flaggenvalidierung fehlgeschlagen für folgende Länder:');
      failedCountries.forEach(({ iso2, code, error }) => {
        console.error(`- ${iso2} (Eingabe: ${code}): ${error}`);
      });
      throw new Error(`Flaggenvalidierung fehlgeschlagen für ${failedCountries.length} Länder. Siehe vorherige Logeinträge für Details.`);
    }
  });
  
  // 2) Flaggendarstellung für alle country codes nach API Call
  test('Validiere Flaggendarstellung für alle country codes NACH API Call', async ({ page }) => {
    test.setTimeout(1200000); 

    const phoneInput = page.locator(inputSelectors.accountLogin.billing.phone);
    await expect(phoneInput).toBeVisible();

    const flagContainer = phoneInput.locator('xpath=..').locator('.endereco-flag');
    await expect(flagContainer).toBeVisible();

    const failedFieldValidation = [];
    const failedFlagValidation = [];

    for (const { iso2, code } of testFlagMapping) {
      const validNumber = validNumbersAllCountries[iso2];
      if (!validNumber) {
        failedFieldValidation.push({ iso2, code, error: `Keine gültige Nummer für ${iso2} gefunden` });
        continue;
      }

      await fillAndWait(page, phoneInput, validNumber);

      try {
        await validateFieldState(page, phoneInput, [], 'green');
      } catch (error) {
        failedFieldValidation.push({ iso2, code, error: error.message });
      }

      try {
        await verifyFlag(flagContainer, iso2);
      } catch (error) {
        failedFlagValidation.push({ iso2, code, error: error.message });
      }
    }

    if (failedFieldValidation.length || failedFlagValidation.length) {
      if (failedFieldValidation.length) {
        console.error('\nFeldvalidierung fehlgeschlagen für folgende Länder:');
        failedFieldValidation.forEach(({ iso2, code }) => {
          console.error(`- ${iso2} (Eingabe: ${code}`);
        });
      }
      
      if (failedFlagValidation.length) {
        console.error('\nFlaggenvalidierung fehlgeschlagen für folgende Länder:');
        failedFlagValidation.forEach(({ iso2, code }) => {
          console.error(`- ${iso2} (Eingabe: ${code}`);
        });
      }
      
      throw new Error(`Validierung fehlgeschlagen - Feldvalidierung: ${failedFieldValidation.length} Länder, Flaggenvalidierung: ${failedFlagValidation.length} Länder. Siehe vorherige Logeinträge für Details.`);
    }
  }); 

  test.afterAll(async () => {
    console.log('Starte globalen Cleanup...');
    await setStandardConfig();
  });
});
