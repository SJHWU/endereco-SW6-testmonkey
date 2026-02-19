// phone-testData-generator.js
/**
 * Generiert Test-Varianten einer Telefonnummer (gültig und ungültig)
 * @param {Object} phoneData - Phone-Objekt mit countryPrefix, nationalPrefix, nationalBody, type, country
 * @returns {Array} Array von Varianten mit isValid flag
 */

export function generatePhoneTestData(phoneData) {
    const { countryPrefix, nationalPrefix, nationalBody, type, country } = phoneData;
    
    // Verschiedene Formate der gleichen Nummer
    const e164 = `${countryPrefix}${nationalPrefix.replace(/^0/, '')}${nationalBody}`; // +49123456789
    const national = `${nationalPrefix} ${nationalBody}`; // 01234 56789 
    const international = `${countryPrefix} ${nationalPrefix.replace(/^0/, '')} ${nationalBody}`; // +49 1234 567890
    
    const variants = [];

    // === GÜLTIGE VARIANTEN ===

    // Original E.164 (ohne Leerzeichen)
    variants.push({
        fullPhone: e164,
        isValid: true,
        category: `original-e164-${type}`,
        type,
        country
    });
    
    // Original international (mit Ländervorwahl)
    variants.push({
        fullPhone: international,
        isValid: true,
        category: `original-international-${type}`,
        type,
        country
    });

    // Original national 
    variants.push({
        fullPhone: national,
        isValid: true,
        category: `original-national-${type}`,
        type,
        country
    });

    // Country Prefix mit doppelter Null statt Plus (gültig, wird aber umgewandelt)
    variants.push({
        fullPhone: `00${countryPrefix.replace('+', '')}${nationalPrefix.replace(/^0/, '')}${nationalBody}`,
        isValid: true,
        category: `double-zero-country-prefix-${type}`,
        type,
        country
     });

    // Mit Bindestrichen (gültig)
    variants.push({
        fullPhone: `${countryPrefix}-${nationalPrefix.replace(/^0/, '')}-${nationalBody}`,
        isValid: true,
        category: `with-dashes-${type}`,
        type,
        country
    });

    // Mit Klammern um Vorwahl (gültig)
    variants.push({
        fullPhone: `${countryPrefix} (${nationalPrefix.replace(/^0/, '')}) ${nationalBody}`,
        isValid: true,
        category: `with-parentheses-${type}`,
        type,
        country
    });

    // National ohne Leerzeichen
    variants.push({
        fullPhone: `${nationalPrefix}${nationalBody}`,
        isValid: true,
        category: `national-without-spaces-${type}`,
        type,
        country
    });

    //E.164 mit 0 als nationaler Präfix (nicht korrekt, wird aber vom plugin akzeptiert und umgewandelt)
    variants.push({
        fullPhone: `${countryPrefix}0${nationalPrefix.replace(/^0/, '')}${nationalBody}`,
        isValid: true,
        category: `e164-with-zero-prefix-${type}`,
        type,
        country
    });

    //International mit 0 als nationaler Präfix (nicht korrekt, wird aber vom plugin akzeptiert und umgewandelt)
    variants.push({
        fullPhone: `${countryPrefix} 0${nationalPrefix.replace(/^0/, '')} ${nationalBody}`,
        isValid: true,
        category: `international-zero-prefix-${type}`,
        type,
        country
    });

    // === UNGÜLTIGE VARIANTEN ===

    // Zu kurz (weniger als 6 Ziffern)
    variants.push({
        fullPhone: `${countryPrefix}${nationalPrefix.substring(0, 2)}`,
        isValid: false,
        category: `too-short-${type}`,
        type,
        country
    });

    // Zu lang (mehr als 15 Ziffern)
    variants.push({
        fullPhone: `${countryPrefix}${nationalPrefix}${nationalBody}9999999999`,
        isValid: false,
        category: `too-long-${type}`,
        type,
        country
    });
/*
    // Mit Buchstaben
    variants.push({
        fullPhone: `${countryPrefix}${nationalPrefix}${nationalBody}abc`,
        isValid: false,
        category: `with-letters-${type}`,
        type,
        country
    });

    // Mit ungültigen Sonderzeichen
    variants.push({
        fullPhone: `${countryPrefix}#${nationalPrefix}*${nationalBody}`,
        isValid: false,
        category: `invalid-special-chars-${type}`,
        type,
        country
    });

    // Nur Leerzeichen/leer
    variants.push({
        fullPhone: '   ',
        isValid: false,
        category: `empty-or-whitespace-${type}`,
        type,
        country
    });

    // Doppelte Ländervorwahl
    variants.push({
        fullPhone: `${countryPrefix}${countryPrefix}${nationalPrefix.replace(/^0/, '')}${nationalBody}`,
        isValid: false,
        category: `double-country-prefix-${type}`,
        type,
        country
    });

    // Fehlende wichtige Teile (nur Ländervorwahl)
    variants.push({
        fullPhone: countryPrefix,
        isValid: false,
        category: `country-prefix-only-${type}`,
        type,
        country 
    });
*/
    return variants;
}


//console.log(generatePhoneTestData(baseData[0]));