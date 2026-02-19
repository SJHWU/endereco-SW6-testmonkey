import { translate } from "./translate";

export async function checkDifferentShippingAddress(page) {
  const shippingCheckbox = page.getByRole('checkbox', { 
    name: translate('account:registerDifferentShipping'),
    exact: false 
   });
  await shippingCheckbox.check();
}