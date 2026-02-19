import 'dotenv/config';
import { getToken } from "./tokens.js";

const { BASE_URL } = process.env;

export async function getPluginConfig(configKey) {
  const token = await getToken();

  const fullKeys = [
    `EnderecoShopware6Client.config.${configKey}`,
    `EndercoShopware6ClientStore.config.${configKey}`,
  ];

  const response = await fetch(`${BASE_URL}/api/search/system-config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      "filter": [
        {
          "type": "multi",
          "operator": "OR",
          "queries": fullKeys.map(key => ({
            "type": "equals",
            "field": "configurationKey",
            "value": key
          }))
        }
      ],
      "limit": 1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fehler beim Abrufen der Config: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const configSetting = result.data.length > 0 ? result.data[0] : null;
  const value = configSetting ? configSetting['configurationValue'] : null;
  return value;
}
