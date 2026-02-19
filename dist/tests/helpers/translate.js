import storeFrontDE from '../../src/data/snippets_SW/storefront.de.json' with { type: 'json' };
import storeFrontEN from '../../src/data/snippets_SW/storefront.en.json' with { type: 'json' };
import storeFrontDE_endereco from '../../src/data/snippets_Endereco/storefront.de-DE.json' with { type: 'json' };
import storeFrontEN_endereco from '../../src/data/snippets_Endereco/storefront.en-GB.json' with { type: 'json' };
import 'dotenv/config';
import { getToken } from "./tokens.js";

const { BASE_URL, STORE_API_KEY, SHOP_LANGUAGE } = process.env;

export function translate(key) {
    if(key.startsWith('enderecoshopware6client')) {
        const keys = key.split(/[:.]/);
        const data = SHOP_LANGUAGE === 'de' ? storeFrontDE_endereco : storeFrontEN_endereco;
        return keys.reduce((obj, k) => obj?.[k], data);
    } else {
        const keys = key.split(/[:.]/);
        const data = SHOP_LANGUAGE === 'de' ? storeFrontDE : storeFrontEN;
        return keys.reduce((obj, k) => obj?.[k], data);
    }
}





