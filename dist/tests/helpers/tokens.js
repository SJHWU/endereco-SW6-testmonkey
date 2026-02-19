import 'dotenv/config';
import fetch from 'node-fetch';

const { BASE_URL, CLIENT_ID, CLIENT_SECRET } = process.env;

export async function getToken() {
  const response = await fetch(`${BASE_URL}/api/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });

  if (!response.ok) throw new Error('Auth-Fehler: ' + response.statusText);
  
  const data = await response.json();
  return data.access_token;
}

export function createContextToken() {
    const contextToken = Math.random().toString(36).substring(2, 15); 
    return contextToken;
}