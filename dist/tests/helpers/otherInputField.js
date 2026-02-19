import { expect } from '@playwright/test';
import { validateFieldState } from './fieldValidators.js';
import { checkDifferentShippingAddress } from './checkDifferentShippingAddress.js';


export async function setupOtherInputField(page, selectors, currentSelector) {
  await checkDifferentShippingAddress(page);
  return page.locator(selectors.find(sel => sel !== currentSelector)); 
}

export async function validateOtherInputField(page, otherInput) {
  await validateFieldState(page, otherInput, false, [], 'none');
  await expect(otherInput).toHaveValue('');
}
