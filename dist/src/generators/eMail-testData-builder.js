import baseDataSet from '../data/eMail-baseData.json' with { type: 'json' };
import { generateEMailTestData } from './eMail-testData-generator.js';

const eMailTestData = baseDataSet.map(emailData => ({
    baseData: emailData,
    variants: generateEMailTestData(emailData)
}));

// Alle Varianten in eine flache Liste umwandeln und nach Testfällen gruppieren

// 1. Gültige und existierende E-Mails (isValid: true, isExistent: true)
export const validExistentVariants = eMailTestData.flatMap(({ baseData, variants }) =>
  variants.filter(v => v.isValid && v.isExistent).map(v => ({
    ...v,
    baseEmail: `${baseData.localPart}@${baseData.domain}.${baseData.tld}`
  }))
);

// 2. Syntaktisch gültige aber nicht existierende E-Mails (isValid: true, isExistent: false)
export const validNonexistentVariants = eMailTestData.flatMap(({ baseData, variants }) =>
  variants.filter(v => v.isValid && !v.isExistent).map(v => ({
    ...v,
    baseEmail: `${baseData.localPart}@${baseData.domain}.${baseData.tld}`
  }))
);

// 3. Syntaktisch ungültige E-Mails (isValid: false, isExistent: false)
export const invalidVariants = eMailTestData.flatMap(({ baseData, variants }) =>
  variants.filter(v => !v.isValid).map(v => ({
    ...v,
    baseEmail: `${baseData.localPart}@${baseData.domain}.${baseData.tld}`
  }))
);

//4. von jedem Typ ein Beispiel
export const oneOfEach = [
  validExistentVariants[0],
  validNonexistentVariants[0],
  invalidVariants[0]
];

