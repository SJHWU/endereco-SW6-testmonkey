/**
 * Setzt Plugin-Einstellungen direkt über die Admin API
 * @param {Object} settings - Ein Objekt mit Key-Value Paaren
 */
import 'dotenv/config';
import { getToken } from "./tokens.js";

const { BASE_URL } = process.env;

export async function setPluginConfig(settings) {
  //settings bearbeiten, beide prefixe setzen
  const token = await getToken();
  
  //Präfixe für GitHub- und für Storeversion für die Plugin-Konfiguration berücksichtigen
  const prefixes = ['EnderecoShopware6Client.config.', 'EnderecoShopware6ClientStore.config.'];
  const prefixedSettings = {};
  for (const [key, value] of Object.entries(settings)) {
    for (const prefix of prefixes) {
      prefixedSettings[`${prefix}${key}`] = value;
    }
  }

  console.log(prefixedSettings);

  const response = await fetch(`${BASE_URL}/api/_action/system-config`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(prefixedSettings)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fehler beim Setzen der Config: ${response.status} - ${errorText}`);
  }

  console.log('✓ Plugin-Konfiguration via API aktualisiert.');
}