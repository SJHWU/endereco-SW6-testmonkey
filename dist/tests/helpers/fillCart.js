/**
 * Füllt den Warenkorb mit einem Produkt via UI
 * @param {import('@playwright/test').Page} page - Die Playwright Page-Instanz
 */
import 'dotenv/config';
import { acceptCookies } from './acceptCookies.js';
import { translate } from './translate.js';
import { expect } from '@playwright/test';

const { BASE_URL, PRODUCT_NUMBER } = process.env;


export async function fillCart(page) {
  console.log('Fülle Warenkorb via UI');

  await page.goto(`${BASE_URL}/search?search=${PRODUCT_NUMBER}`); // Direkt zur Suche mit Artikelnummer
  await page.waitForLoadState('networkidle');
  await acceptCookies(page); // Cookies akzeptieren, falls vorhanden

  const buyButton = page.getByRole('button', { 
        name: translate('listing:boxAddProduct'),
        exact: false }).first();

  await expect(buyButton).toBeVisible();
  await page.waitForTimeout(750);
  await buyButton.click();
 
  const checkoutBtn = page.getByRole('link', { 
     name: translate('checkout:proceedToCheckout'),
     exact: false }); 
  //await checkoutBtn.waitFor({ state: 'visible', timeout: 5000 });
  await expect(checkoutBtn).toBeVisible();
  await checkoutBtn.click();
    console.log(translate('checkout:proceedToCheckout') + ' Button geklickt, weiter zum Checkout...');
    await page.waitForLoadState('networkidle');
}


