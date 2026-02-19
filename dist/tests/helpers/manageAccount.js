import 'dotenv/config';
import crypto from 'crypto';

import { expect, request } from '@playwright/test';
import formData from '../../src/data/complete-formData.json' with { type: 'json' };
import { getToken } from './tokens.js';
import { translate } from "./translate";
import * as inputSelectors from '../../src/data/inputSelectors.js';

const { BASE_URL, ACCOUNT_LOGIN_URL, GROUP_ID, SALES_CHANNEL_ID, SALUTATION_ID, COUNTRY_ID } = process.env;


export async function loginAccount (page)  {
    console.log('Einloggen via UI');
  
    await page.goto(BASE_URL + ACCOUNT_LOGIN_URL, { waitUntil: 'networkidle' } );

    //Fülle die Login Felder mit den Testdaten
    await page.fill(inputSelectors.accountLogin.login.loginMail, formData.email);
    await page.fill(inputSelectors.accountLogin.login.loginPassword, formData.password);
    
    //Klicke auf das "Einloggen"-Button, um zum nächsten Schritt zu gelangen
    const loginButton = page.getByRole('button', { name: translate('account:loginSubmit') });
    await loginButton.click();  

    await page.waitForLoadState('networkidle'); 
} 


export async function navigateAccount(page, editAddress) {
    const addressLink = page.getByRole('link', { name: translate('account:addressWelcome') });
    await expect(addressLink).toBeVisible();
    await addressLink.click();
    await page.waitForTimeout(500);

    if (editAddress) {
      const editButton = page.getByRole('button', { name: translate('account:addressOptionsBtn') }).first();
      await expect(editButton).toBeVisible();
      await editButton.click();
      await page.waitForTimeout(500);
      const editLink = page.getByRole('link', { name: translate('global:default:edit') });
      await expect(editLink).toBeVisible();
      await editLink.click();
    } else {
      const addLink = page.getByRole('link', { name: translate('account:addressCreateBtn') });
      await expect(addLink).toBeVisible();
      await addLink.click();
    }
    await page.waitForLoadState('networkidle');

}

  async function deleteCustomer(eMail, apiContext) {
    console.log(`\n🔍 Versuche Kunde zu löschen: ${eMail}`);

    // Suche via Playwright Context
    const searchRes = await apiContext.post('/api/search/customer', {
        data: {
            filter: [{ type: 'equals', field: 'email', value: eMail }]
        }
    });

    if (!searchRes.ok()) {
        console.error('❌ Fehler bei der Kundensuche');
        return false;
    }

    const { data } = await searchRes.json();
    console.log(`📊 Suchergebnis: ${data?.length || 0} Kunde(n) gefunden`);

    if (data && data.length > 0) {
        const id = data[0].id;
        console.log(`🗑️  Lösche Kunde mit ID: ${id}`);
        
        const deleteRes = await apiContext.delete(`/api/customer/${id}`);
        
        if (deleteRes.ok()) {
            console.log('✅ Kunde erfolgreich gelöscht');
            return true;
        } else {
            console.log(`❌ Löschen fehlgeschlagen: ${deleteRes.status()}`);
            return false;
        }
    }

    console.log('ℹ️  Kein Kunde gefunden - nichts zu löschen');
    return false;
}

export async function createAccountAPI() {
    const token = await getToken();

    // 1. API Context einmalig erstellen
    const apiContext = await request.newContext({
        baseURL: BASE_URL,
        extraHTTPHeaders: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    try {
        // 2. Bestehenden Account löschen
        await deleteCustomer(formData.email, apiContext);

        console.log('Erstelle Account via API');
        const addressId = crypto.randomUUID().replace(/-/g, '');
        const customerId = crypto.randomUUID().replace(/-/g, '');

        const response = await apiContext.post('/api/customer', {
            data: {
                id: customerId,
                groupId: GROUP_ID,
                salesChannelId: SALES_CHANNEL_ID,
                defaultBillingAddressId: addressId,
                defaultShippingAddressId: addressId,
                salutationId: SALUTATION_ID,
                customerNumber: `TEST-${Date.now()}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                active: true,
                addresses: [{
                    id: addressId,
                    salutationId: SALUTATION_ID,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    street: formData.streetFull,
                    zipcode: formData.postCode,
                    city: formData.city,
                    countryId: COUNTRY_ID,
                    phoneNumber: formData.phoneMobile
                }]
            }
        });

        if (!response.ok()) {
            const errorBody = await response.text();
            throw new Error(`API Fehler beim Erstellen ${response.status()}: ${errorBody}`);
        }

        console.log('✅ Account erfolgreich erstellt');
    } finally {
        // Sicherstellen, dass der Context immer geschlossen wird
        await apiContext.dispose();
    }
}