import { validateFieldState } from './fieldValidators.js';
import { fillAndWait } from './fillField.js';


export async function clearAndValidate(page, inputField) {
 
  await fillAndWait(page, inputField, '');

  await validateFieldState(page, inputField, false, [], 'none');
}
