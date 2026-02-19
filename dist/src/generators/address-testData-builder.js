import baseDataSet from '../data/address-baseData.json' with { type: 'json' };
import { generateAddressTestData } from './address-testData-generator.js';

const addressTestData = baseDataSet.map(addressData => ({
    baseData: addressData,
    variants: generateAddressTestData(addressData)
}));

// Alle Varianten in eine flache Liste umwandeln und nach Testfällen gruppieren

// 1. Gültige Original-Adressen (correctionType: 'none')
export const validOriginalVariants = addressTestData.flatMap(({ baseData, variants }) =>
  variants.filter(v => v.correctionType === 'none').map(v => ({
    ...v,
    baseData
  }))
);

// 2. Fast perfekte Adressen (correctionType: 'almost-perfect')
export const almostPerfectVariants = addressTestData.flatMap(({ baseData, variants }) =>
  variants.filter(v => v.correctionType === 'almost-perfect').map(v => ({
    ...v,
    baseData
  }))
);

// 3. Adressen mit kleineren Korrekturen (correctionType: 'minor')
export const minorCorrectionVariants = addressTestData.flatMap(({ baseData, variants }) =>
  variants.filter(v => v.correctionType === 'minor').map(v => ({
    ...v,
    baseData
  }))
);

console.log('Valid Original Variants:', validOriginalVariants);
console.log('Almost Perfect Variants:', almostPerfectVariants);
console.log('Minor Correction Variants:', minorCorrectionVariants);