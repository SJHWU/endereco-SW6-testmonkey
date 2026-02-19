import crypto from 'crypto';


export function getNormalizedHash(svgString) {
  const dnaParts = [];

  // 1. HEX-Farben extrahieren & normieren (#abc -> #AABBCC)
  // Findet # gefolgt von 3 oder 6 Hex-Zeichen
  const hexMatches = svgString.match(/#[0-9a-fA-F]{3,6}/g) || [];
  const normalizedColors = hexMatches.map(hex => {
    let c = hex.toUpperCase();
    if (c.length === 4) { 
      c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    }
    return `color:${c}`;
  });
  dnaParts.push(...normalizedColors);

  // 2. Relevante Geometrie-Attribute extrahieren
  const attrRegex = /(?:\s|^)(x|y|width|height|cx|cy|r|d)=["']([^"']+)["']/g;
  let match;
  const attrs = [];

  while ((match = attrRegex.exec(svgString)) !== null) {
    const name = match[1].toLowerCase();
    let value = match[2].trim();

    // Pfad-Daten (d) normieren: Leerzeichen minimieren, da Browser hier variieren
    if (name === 'd') {
      value = value.replace(/\s+/g, '').toUpperCase();
    }

    attrs.push(`${name}:${value}`);
  }

  // Attribute sortieren
  dnaParts.push(...attrs.sort());

  const dna = dnaParts.join('|');

  console.log(`Normierter String für Hashing:\n${dna}`);

  return crypto.createHash('md5').update(dna).digest('hex');
}