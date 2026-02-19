/*
 * Akzeptiert technisch notwendige Cookies, falls ein Cookie-Banner vorhanden ist.
 *
*/

import { translate } from "./translate";

export async function acceptCookies(page) {
  const acceptButton = page.getByRole('button', { 
      name: translate('cookie:deny'),
      exact: false });
  try {
    await acceptButton.waitFor({ state: 'visible', timeout: 2000 });
    await acceptButton.click();
    await acceptButton.waitFor({ state: 'hidden', timeout: 2000 });
    console.log('Cookie-Banner akzeptiert, fahre fort.');
  } catch (e) {
    // Falls kein Banner vorhanden ist, einfach weitermachen
    console.log('Kein Cookie-Banner gefunden, fahre fort.');
    return;
  }
}