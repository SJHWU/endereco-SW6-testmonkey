import { expect } from '@playwright/test';
import { translate, translateSubdivision } from './translate.js';
import { enderecoSelectors } from '../../src/data/enderecoSelectors.js';


export async function useSelectedAddress(page, enderecoModal) {
  const useSelectionButton = enderecoModal.getByRole('button', { name: translate('enderecoshopware6client:texts:useSelected') });
  await expect(useSelectionButton).toBeVisible();
  await useSelectionButton.click();
  await expect(enderecoModal).not.toBeVisible();
  await page.waitForTimeout(1000);
}

export async function confirmOriginalInput(page, enderecoModal, requiresCheckbox) {
  const originalList = enderecoModal.locator(enderecoSelectors.originalList);
  await expect(originalList).toBeVisible();
  await expect(originalList).toHaveCount(1);
  const originalLabel = originalList.locator(enderecoSelectors.predictionLabel);
  await expect(originalLabel).toBeVisible();
  await originalLabel.click();
  await page.waitForTimeout(500);

  if (requiresCheckbox) {
    console.log(enderecoSelectors.confirmCheckbox);
    const confirmCheckbox = enderecoModal.getByRole('checkbox', enderecoSelectors.confirmCheckbox );
    await expect(confirmCheckbox).toBeVisible();
    await confirmCheckbox.check();
  }

  await useSelectedAddress(page, enderecoModal);
}

export async function validateEnderecoModal (page, enderecoModal, hasCloseIcon, variant, formType) {
  await expect(enderecoModal).toBeVisible();
  const closeIcon = enderecoModal.locator(enderecoSelectors.modalClose);
  const headerMain = enderecoModal.locator(enderecoSelectors.modalHeaderMain);
  const headerSub = enderecoModal.locator(enderecoSelectors.modalHeaderSub);
  const predictionList = enderecoModal.locator(enderecoSelectors.predictionList);
  const originalList = enderecoModal.locator(enderecoSelectors.originalList);

  hasCloseIcon ? await expect(closeIcon).toBeVisible() : await expect(closeIcon).not.toBeVisible();
  await expect(headerMain).toBeVisible();
  await expect(headerSub).toBeVisible();
  await expect(originalList).toBeVisible();
  await expect(originalList).toHaveCount(1);

  switch (variant.category) {
    case 'original-no-subdivision':
    case 'house-number-before-street-no-subdivision':
    case 'typo-in-street':
    case 'wrong-subdivision':
        if (formType === 'billing') {
          await expect(headerMain).toHaveText(translate('enderecoshopware6client:texts:billing_address'));
        } else if (formType === 'shipping') {
          await expect(headerMain).toHaveText(translate('enderecoshopware6client:texts:shipping_address'));
        } else {
          await expect(headerMain).toHaveText(translate('enderecoshopware6client:texts:general_address'));
        }
        await expect(headerSub).toHaveText(translate('enderecoshopware6client:texts:popUpSubline'));  
        await expect(predictionList).toBeVisible();
        await expect(predictionList).toHaveCount(1);

        // hier muss noch die policy für die Anzeige der Vorschläge geklärt werden
        /*
        const firstSuggestion = predictionList.locator(enderecoSelectors.predictionItem).first();
        const expectedPattern = new RegExp(
          `${variant.baseData.streetFull}.*${variant.baseData.postCode}.*${variant.baseData.city}.*${translateSubdivision(variant.baseData.subdivisionCode)}`,
          's'
        );
        await expect(firstSuggestion).toHaveText(expectedPattern); */
        break;
  }
}
