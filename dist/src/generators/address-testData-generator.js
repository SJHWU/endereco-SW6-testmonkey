import countriesDE from '../data/countries/countries.de-DE.json' with { type: 'json' };
import subdivisionsDE from '../data/subdivisons/subdivisions.de-DE.json' with { type: 'json' };

const removeRandomChar = (inputString) => {
    if (inputString.length <= 1) return inputString;
    const i = Math.floor(Math.random() * (inputString.length - 1)) + 1;
    return inputString.slice(0, i) + inputString.slice(i + 1);
};

export function generateAddressTestData(addressData) {
    const { countryCode, subdivisionCode, postCode, city, street, houseNumber, streetFull, additionalInfo, } = addressData;
    const variants = [];

    // === GÜLTIGE VARIANTEN ===

    // Original mit Angabe des Bundeslandes ===
    variants.push({
        ...addressData,
        category: 'original',
        correctionType: 'none'
    });

    // === Almost Perfect ===

    // Hausnummer vor Straße mit Angabe des Bundeslandes
    variants.push({
        ...addressData,
        street: `${houseNumber} ${street}`,
        houseNumber: '',
        streetFull: `${houseNumber} ${street}`,
        category: 'houseNumber-before-street',
        correctionType: 'almost-perfect'
    });

    // === Minor Corrections ===
 
    // Original ohne Angabe des Bundeslandes ===
    variants.push({
        ...addressData,
        subdivisionCode: '',
        category: 'original-no-subdivision',
        correctionType: 'minor'
    });

    // Hausnummer vor Straße ohne Angabe des Bundeslandes
    variants.push({
        ...addressData,
        subdivisionCode: '',
        street: `${houseNumber} ${street}`,
        houseNumber: '',
        streetFull: `${houseNumber} ${street}`,
        category: 'houseNumber-before-street-no-subdivision',
        correctionType: 'minor'
     });

    // Tippfehler im Straßennamen (1 zufälliges Zeichen entfernt, nicht das erste)
    const typoStreet = removeRandomChar(street);
    variants.push({
        ...addressData,
        street: typoStreet,   
        streetFull: `${typoStreet} ${houseNumber}`,
        category: 'typo-in-street',
        correctionType: 'minor'
    });

    // Falsches Bundesland
    const wrongSubdivision = Object.keys(subdivisionsDE).find(code => code.startsWith(countryCode) && code !== subdivisionCode);
    if (wrongSubdivision) {
        variants.push({
            ...addressData,
            subdivisionCode: wrongSubdivision,
            category: 'wrong-subdivision',
            correctionType: 'minor'
        });
    }

    return variants;

}