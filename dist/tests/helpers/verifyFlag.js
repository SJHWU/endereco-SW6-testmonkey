import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { getNormalizedHash } from "./getNormalizedHash";

export async function verifyFlag(flagContainer, countryCode) {
    const currentHtml = await flagContainer.innerHTML();
    const currentHash = getNormalizedHash(currentHtml);

    const filePath = path.join(process.cwd(), 'dist', 'src', 'data', 'flags', `${countryCode.toLowerCase()}.svg`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Flag-Datei für ${countryCode} nicht gefunden: ${filePath}`);
    }

    const expectedHtml = fs.readFileSync(filePath, 'utf-8');
    const expectedHash = getNormalizedHash(expectedHtml);

    expect(currentHash).toBe(expectedHash);

}

