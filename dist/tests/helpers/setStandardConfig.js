import 'dotenv/config';
import { setPluginConfig } from './setPluginConfig';

const { ENDERECO_API_KEY, ENDERECO_API_URL } = process.env;

export async function setStandardConfig() {
  await setPluginConfig({
    'enderecoApiKey': ENDERECO_API_KEY,
    'enderecoRemoteUrl': ENDERECO_API_URL,

    'enderecoActiveInThisChannel': true,

    'enderecoNameCheckActive': true,
    'enderecoExchangeNamesAutomatically': true,

    'enderecoEmailCheckActive': true,
    'enderecoShowEmailStatus': true,

    'enderecoAMSActive': true,
    'enderecoAddressInputAssistantActive': true,
    'enderecoAllowCloseIcon': true,
    'enderecoConfirmWithCheckbox': true,
    'enderecoSplitStreetAndHouseNumber': false,
    'enderecoCheckExistingAddress': true,
    'enderecoCheckPayPalExpressAddress': true,

    'enderecoPhsActive': true,
    'enderecoPhsDefaultFieldType': 'general',
    'enderecoPhsUseFormat': 'E164',
    'enderecoShowPhoneErrors': true, 
    
    'enderecoTriggerOnBlur': true,
    'enderecoTriggerOnSubmit': true,
    'enderecoContinueSubmit': true,
    'enderecoAllowNativeAddressFieldsOverwrite': true,
    'enderecoLoadCss': "file",
    'enderecoWhitelistController': true,

    'enderecoPreselectDefaultCountryCode': 'DE'

  }); 
}  