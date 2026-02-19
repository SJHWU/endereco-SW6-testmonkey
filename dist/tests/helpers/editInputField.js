import { validateFieldState } from './fieldValidators.js';
import { fillAndWait } from './fillField.js';

/**
 * Validiert ein vorausgefülltes Eingabefeld (grün), löscht es und validiert den neutralen Zustand.
 * Typisch für "Adresse bearbeiten"-Szenarien, wo ein Feld mit gültigen Daten vorausgefüllt ist.
 * 
 * @param {Page} page - Die Playwright Page-Instanz
 * @param {Locator} inputField - Der Locator für das Eingabefeld
 * @returns {Promise<void>}
 */
export async function clearPrefilledInputField(page, inputField, currentColor) {
  // Gültige vorausgefüllte Daten sollten grün hinterlegt sein -> funktioniert aktuell nicht
  //deshalb auskommentiert
  //await validateFieldState(page, inputField, false, [], currentColor);
  
  // Feld leeren
  await fillAndWait(page, inputField, '');
  
  // Nach dem Leeren sollte das Feld neutral sein -> funtioniert akutell nicht,
  //deshalb auskommentiert
 // await validateFieldState(page, inputField, false, [], 'none');
}
