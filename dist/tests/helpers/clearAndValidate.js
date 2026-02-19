import { validateFieldState, validateAddressState } from './fieldValidators.js';
import { fillAndWait } from './fillFields.js';

export async function clearAndValidate(page, inputField) {
  await fillAndWait(page, inputField, '', 1500); 

  await validateFieldState(page, inputField, [], 'none');
}

export async function clearAddressAndValidate(page, addressSelector, splitStreet) {
  console.log('Clearing address fields and validating state...');
  const zipCodeInput = page.locator(addressSelector.zipCode);
  const cityInput = page.locator(addressSelector.city);
  const streetInput = page.locator(addressSelector.street);
  const houseNumberInput = page.locator(addressSelector.houseNumber);
  const streetFullInput = page.locator(addressSelector.streetFull);

  // Array mit allen möglichen Feldern, abhängig von splitStreet
  const allFields = splitStreet
    ? [zipCodeInput, cityInput, streetInput, houseNumberInput]
    : [zipCodeInput, cityInput, streetFullInput];

  // Werte der Felder asynchron abrufen
  const fieldValues = await Promise.all(allFields.map(f => f.inputValue()));

  // Nur die Locator behalten, deren Textwert nicht leer ist
  const fieldsToChooseFrom = allFields.filter((_, index) => fieldValues[index].trim() !== '');

  if (fieldsToChooseFrom.length === 0) {
    console.log('Alle Felder sind bereits leer.');
    return;
  }

  // Zufälliges Feld auswählen
  const randomField = fieldsToChooseFrom[Math.floor(Math.random() * fieldsToChooseFrom.length)];
  
  // Nur das zufällig gewählte Feld leeren
  await randomField.fill('');
  await page.waitForTimeout(2000);

  await validateAddressState(page, addressSelector, ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'], splitStreet);
}
