// dist/src/generators/phone-testData-builder.js
import baseDataSet from '../data/phone-baseData.json' with { type: 'json' };
import { generatePhoneTestData } from './phone-testData-generator.js';

const phoneTestData = baseDataSet.map(phoneData => {
  const { countryPrefix, nationalPrefix, nationalBody } = phoneData;

  // Normierte Formate, abgeleitet vom Basis-Datensatz
  const E164 = `${countryPrefix}${nationalPrefix.replace(/^0/, '')}${nationalBody}`; // +49123456789
  const NATIONAL = `${nationalPrefix} ${nationalBody}`; // 01234 56789 
  const INTERNATIONAL = `${countryPrefix} ${nationalPrefix.replace(/^0/, '')} ${nationalBody}`; // +49 1234 567890

  const variants = generatePhoneTestData(phoneData).map(v => ({
    // ursprüngliche Eingabe/Variante
    raw: v.fullPhone,
    // Flag ob syntaktisch gültig
    isValid: v.isValid,
    category: v.category,
    type: v.type,
    country: v.country,
    // vordefinierte Repräsentationen, Tests wählen targetFormat
    formats: {
      E164,
      NATIONAL,
      INTERNATIONAL
    }
  }));

  return {
    variants
  };
});

// Alle Varianten in eine flache Liste umwandeln und nach Testfällen gruppieren

// 1. Gültige Telefonnummern (isValid: true)
export const validVariants = phoneTestData.flatMap(({ variants }) =>
  variants.filter(v => v.isValid).map(v => ({ ...v }))
);

// 2. Syntaktisch ungültige Telefonnummern (isValid: false)
export const invalidVariants = phoneTestData.flatMap(({ variants }) =>
  variants.filter(v => !v.isValid).map(v => ({ ...v }))
);

//3. Gültige Festnetznummern (isValid: true und type: 'landline')
export const validLandlineVariants = phoneTestData.flatMap(({ variants }) =>
  variants.filter(v => v.isValid && v.type === 'landline').map(v => ({ ...v }))
);

//4. Gültige Mobilnummern (isValid: true und type: 'mobile')
export const validMobileVariants = phoneTestData.flatMap(({ variants }) =>
  variants.filter(v => v.isValid && v.type === 'mobile').map(v => ({ ...v }))
);

//5. ein gültiges und ein ungültiges Beispiel
export const oneOfEach = [validVariants[0], invalidVariants[0]];

//6. ein gültiges Beispiel von Festnetz und Mobil
export const oneValidOfEachType = [validLandlineVariants[0], validMobileVariants[0]]; 
