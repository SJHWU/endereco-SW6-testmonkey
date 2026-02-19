import 'dotenv/config';
import { setPluginConfig } from './setPluginConfig';

const { ENDERECO_API_KEY, ENDERECO_API_URL } = process.env;

export async function setApiConfig() {
  await setPluginConfig({
    'enderecoApiKey': ENDERECO_API_KEY,
    'enderecoRemoteUrl': ENDERECO_API_URL
  }); 
}  