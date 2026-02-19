import { expect } from "@playwright/test";
import { translate } from "./translate";

export async function accessWidgetCheckout(page, editAddress) {  
    const changeAddressLink = page.getByRole('link', { name: translate('account:overviewChangeShipping') });
    await expect(changeAddressLink).toBeVisible();
    await changeAddressLink.click();
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
      const addButton = page.getByRole('button', { name: translate('account:addressCreateBtn') });
      await expect(addButton).toBeVisible();
      await addButton.click();
      console.log('Clicked "Add New Address" button'); 
    }
    await page.waitForLoadState('networkidle');  
}
