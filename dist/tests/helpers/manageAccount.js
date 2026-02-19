import 'dotenv/config';
import fetch from 'node-fetch'; //muss man das überhaupt noch importieren?
import formData from '../../src/data/complete-formData.json' with { type: 'json' };
import { getToken } from './tokens.js';


async function deleteCustomer(eMail) {
    console.log(`\n🔍 Versuche Kunde zu löschen: ${eMail}`);
    const token = await getToken();
  
    // Suche
    console.log('🔎 Suche Kunde in der Datenbank...');
    const searchRes = await fetch(`${BASE_URL}/api/search/customer`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: [{ type: 'equals', field: 'email', value: eMail }]
    })
  });

  const { data } = await searchRes.json();
  console.log(`📊 Suchergebnis: ${data?.length || 0} Kunde(n) gefunden`);

  // Löschen, falls ID gefunden
  if (data && data.length > 0) {
    const id = data[0].id;
    console.log(`🗑️  Lösche Kunde mit ID: ${id}`);
    const deleteRes = await fetch(`${BASE_URL}/api/customer/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (deleteRes.ok) {
      console.log('✅ Kunde erfolgreich gelöscht');
      return true;
    } else {
      console.log(`❌ Löschen fehlgeschlagen: ${deleteRes.statusText}`);
      return false;
    }
  }
  
  console.log('ℹ️  Kein Kunde gefunden - nichts zu löschen');
  return false; // Kein Kunde gefunden
}

export async function createAccount(page) {
    //Account wird gelöscht, falls er bereits existiert
    await deleteCustomer(formData.email);

    console.log('Fülle Formular für Registrierung via UI');
  
    const fullUrl = `${BASE_URL}/account/login`;
    await page.goto(fullUrl);
    await page.waitForLoadState('networkidle'); 
    
    // Fülle die Felder mit den Testdaten
    await page.fill('#billingAddress-personalFirstName', formData.firstName);
    await page.fill('#billingAddress-personalLastName', formData.lastName);
    await page.fill('#personalMail', formData.email);
    await page.fill('#personalPassword', formData.password);
    await page.locator('#billingAddressAddressCountry').selectOption({ label: formData.country });
    await page.fill('#billingAddressAddressZipcode', formData.postCode); 
    await page.fill('#billingAddressAddressCity', formData.city);
    await page.fill('#billingAddressAddressStreet', formData.streetFull);
    await page.fill('#billingAddressAddressPhoneNumber', formData.phone);
    
    //Klicke auf das "Weiter"-Button, um zum nächsten Schritt zu gelangen
    const continueButton = page.locator('.register-submit button');
    await continueButton.click();
    
    // Warte auf die nächste Seite oder eine Bestätigung
    await page.waitForLoadState('networkidle');

}

export async function loginAccount (page)  {
    console.log('Einloggen via UI');
  
    const fullUrl = `${BASE_URL}/account/login`;
    await page.goto(fullUrl);
    await page.waitForLoadState('networkidle'); 

    //Fülle die Login Felder mit den Testdaten
    await page.fill('#loginMail', formData.email);
    await page.fill('#loginPassword', formData.password);
    
    //Klicke auf das "Einloggen"-Button, um zum nächsten Schritt zu gelangen
    const loginButton = page.locator('.login-submit button');
    await loginButton.click();  

    // Warte auf die nächste Seite oder eine Bestätigung
    await page.waitForLoadState('networkidle');
}
