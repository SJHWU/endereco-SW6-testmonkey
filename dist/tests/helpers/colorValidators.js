/**
 * Helper-Funktionen zur Validierung von CSS-Farben in Tests
 */

/**
 * Prüft ob eine CSS-Farbe im grünen Spektrum liegt
 * @param {string} colorString - CSS color string (z.B. "rgb(76, 175, 80)" oder "rgba(76, 175, 80, 0.5)")
 * @returns {boolean} True wenn die Farbe grünlich ist
 */
export function isGreenish(colorString) {
  // Parse RGB-Werte aus dem String
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgbMatch) return false;
  
  const [, r, g, b] = rgbMatch.map(Number);
  
  // Prüfe ob Grün dominant ist:
  // 1. Grün-Kanal muss höher sein als Rot UND Blau
  // 2. Grün-Kanal sollte mindestens 100 sein (um helle Grautöne auszuschließen)
  return g > r && g > b && g >= 100;
}

/**
 * Prüft ob eine CSS-Farbe hell/grünlich ist (für background)
 * @param {string} colorString - CSS color string
 * @returns {boolean} True wenn die Farbe hell und grünlich ist
 */
export function isLightGreenish(colorString) {
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgbMatch) return false;
  
  const [, r, g, b] = rgbMatch.map(Number);
  
  // Prüfe ob es ein helles Grün ist:
  // - Alle Werte sollten relativ hoch sein (> 200)
  // - Grün sollte am höchsten sein
  return r > 200 && g > 200 && b > 200 && g >= r && g >= b;
}


/**
 * Prüft ob eine CSS-Farbe im gelblichen/orangen Spektrum liegt
 * Zielwert: rgb(240, 173, 78) mit Toleranz
 * @param {string} colorString - CSS color string
 * @returns {boolean} True wenn die Farbe gelblich/orange ist
 */
export function isYellowish(colorString) {
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgbMatch) return false;
  
  const [, r, g, b] = rgbMatch.map(Number);
  
  // Toleranzbereich um rgb(240, 173, 78)
  // R: 240 ± 30, G: 173 ± 30, B: 78 ± 30
  const tolerance = 30;
  return (
    r >= 210 && r <= 255 &&
    g >= 143 && g <= 203 &&
    b >= 48 && b <= 108 &&
    r > g && g > b  // Rot > Grün > Blau für Orange/Gelb
  );
}

/**
 * Prüft ob eine CSS-Farbe sehr hell und leicht gelblich ist
 * Zielwert: rgb(254, 251, 248) mit Toleranz
 * @param {string} colorString - CSS color string
 * @returns {boolean} True wenn die Farbe hell und leicht gelblich ist
 */
export function isLightYellowish(colorString) {
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgbMatch) return false;
  
  const [, r, g, b] = rgbMatch.map(Number);
  
  // Toleranzbereich um rgb(254, 251, 248)
  // Alle Werte sehr hoch (fast weiß), mit leichtem Gelbstich
  const tolerance = 10;
  return (
    r >= 244 && r <= 255 &&
    g >= 241 && g <= 255 &&
    b >= 238 && b <= 255 &&
    r >= g && g >= b  // Leichter Warmton: Rot >= Grün >= Blau
  );
}

/**
 * Prüft ob eine CSS-Farbe im grauen Spektrum liegt
 * Zielwert: rgb(121, 132, 144) mit Toleranz
 * @param {string} colorString - CSS color string
 * @returns {boolean} True wenn die Farbe gräulich ist
 */
export function isGreyish(colorString) {
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgbMatch) return false;
  
  const [, r, g, b] = rgbMatch.map(Number);
  
  // Toleranzbereich um rgb(121, 132, 144)
  // R: 121 ± 20, G: 132 ± 20, B: 144 ± 20
  const tolerance = 20;
  return (
    r >= 101 && r <= 141 &&
    g >= 112 && g <= 152 &&
    b >= 124 && b <= 164 &&
    Math.abs(r - g) <= 15 && Math.abs(g - b) <= 15  // Werte sollten relativ nah beieinander sein für Grau
  );
}

/**
 * Prüft ob eine CSS-Farbe im roten Spektrum liegt
 * Zielwert: rgb(194, 0, 23) mit Toleranz
 * @param {string} colorString - CSS color string
 * @returns {boolean} True wenn die Farbe rötlich ist
 */
export function isReddish(colorString) {
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgbMatch) return false;
  
  const [, r, g, b] = rgbMatch.map(Number);
  
  // Toleranzbereich um rgb(194, 0, 23)
  // R: 194 ± 30, G: 0 ± 30, B: 23 ± 30
  const tolerance = 30;
  return (
    r >= 164 && r <= 224 &&
    g >= 0 && g <= 30 &&
    b >= 0 && b <= 53 &&
    r > g && r > b  // Rot muss dominant sein
  );
}