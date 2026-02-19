/**
 * Generiert Test-Varianten einer E-Mail-Adresse (gültig und ungültig)
 * @param {Object} emailData - Email-Objekt mit localPart, domain, tld
 * @returns {Array} Array von Varianten mit isValid flag
 */
export function generateEMailTestData(emailData) {
    const { localPart, domain, tld } = emailData;
    const fullEmail = `${localPart}@${domain}.${tld}`;
    
    const variants = [];

    // === GÜLTIGE VARIANTEN ===
    
    // Original (gültig und existent)
    variants.push({
        fullEmail,
        isValid: true,
        isExistent: true,
        category: 'original'
    });

    // Mit Plus-Alias (gültig und existent)
    variants.push({
        fullEmail: `${localPart}+tag@${domain}.${tld}`,
        isValid: true,
        isExistent: true,
        category: 'plus-alias'
    });

    // === SYNTAKTISCH GÜLTIG ABER NICHT EXISTENT ===
    
    // Unsinnige Zeichenfolge hinzugefügt (syntaktisch gültig, aber nicht existent)
    variants.push({
        fullEmail: `${localPart}xyz99999nonexistent@${domain}.${tld}`,
        isValid: true,
        isExistent: false,
        category: 'valid-but-nonexistent'
    });

    // === UNGÜLTIGE VARIANTEN ===

    // Fehlendes @
    variants.push({
        fullEmail: `${localPart}${domain}.${tld}`,
        isValid: false,
        isExistent: false,
        category: 'missing-at'
    });
    /*
    // Doppeltes @
    variants.push({
        fullEmail: `${localPart}@@${domain}.${tld}`,
        isValid: false,
        isExistent: false,
        category: 'double-at'
    });

    // Fehlende Domain
    variants.push({
        fullEmail: `${localPart}@.${tld}`,
        isValid: false,
        isExistent: false,
        category: 'missing-domain'
    });

    // Fehlende TLD
    variants.push({
        fullEmail: `${localPart}@${domain}`,
        isValid: false,
        isExistent: false,
        category: 'missing-tld'
    });

    // Leerzeichen im localPart
    variants.push({
        fullEmail: `${localPart} space@${domain}.${tld}`,
        isValid: false,
        isExistent: false,
        category: 'space-in-localpart'
    });

    // Punkt am Anfang
    variants.push({
        fullEmail: `.${localPart}@${domain}.${tld}`,
        isValid: false,
        isExistent: false,
        category: 'dot-at-start'
    });

    // Punkt am Ende
    variants.push({
        fullEmail: `${localPart}.@${domain}.${tld}`,
        isValid: false,
        isExistent: false,
        category: 'dot-at-end'
    });

    // Aufeinanderfolgende Punkte
    variants.push({
        fullEmail: `${localPart}..test@${domain}.${tld}`,
        isValid: false,
        isExistent: false,
        category: 'consecutive-dots'
    });

    // Sonderzeichen (ungültig)
    variants.push({
        fullEmail: `${localPart}#$%@${domain}.${tld}`,
        isValid: false,
        isExistent: false,
        category: 'invalid-special-chars'
    });

    // Zu lange localPart (>64 Zeichen)
    variants.push({
        fullEmail: localPart + 'a'.repeat(65) + `@${domain}.${tld}`,
        isValid: false,
        isExistent: false,
        category: 'localpart-too-long'
    });

    // Leere localPart
    variants.push({
        fullEmail: `@${domain}.${tld}`,
        isValid: false,
        isExistent: false,
        category: 'empty-localpart'
    });
    */
    return variants;
}
