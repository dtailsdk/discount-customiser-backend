import { ShopifyToken } from 'models'
import { createDiscountFunction } from './shopify-api/functions'
import { updateMetafield, getPrivateMetafields } from './shopify-api/metafields'

export const METAFIELD_NAMESPACE = '$app:dtails'
export const MINIMUM_CART_METAFIELD_KEY = 'cart_minimum'
export const DISCOUNT_METAFIELD_KEY = 'discount_percentage'

export async function getSettings(dbShop) {
  const privateMetafields = await getPrivateMetafields(dbShop.api(), dbShop.discountId)
  console.log('privateMetafields', JSON.stringify(privateMetafields, null, 2))
}

export async function updateSettings(dbShop, settings) {
  const validation = validateSettings(settings)
  console.log('validation', validation)
  if (validation.valid) {
    console.log('Input was valid')
    if (dbShop.discountId) {
      const metafields = [
        {
          ownerId: dbShop.discountId,
          key: MINIMUM_CART_METAFIELD_KEY,
          namespace: METAFIELD_NAMESPACE,
          type: 'number_integer',
          value: settings.cartMinimum
        },
        {
          ownerId: dbShop.discountId,
          key: DISCOUNT_METAFIELD_KEY,
          namespace: METAFIELD_NAMESPACE,
          type: 'number_integer',
          value: settings.discountPercentage
        }
      ]
      await updateMetafield(dbShop.api(), metafields)
    } else {
      const metafields = [
        {
          description: 'Minimum cart value for extra % to be added',
          key: MINIMUM_CART_METAFIELD_KEY,
          namespace: METAFIELD_NAMESPACE,
          type: 'number_integer',
          value: settings.cartMinimum
        },
        {
          description: 'Discount percent to apply if minimum is met',
          key: DISCOUNT_METAFIELD_KEY,
          namespace: METAFIELD_NAMESPACE,
          type: 'number_integer',
          value: settings.discountPercentage
        }
      ]
      const automaticDiscount = await createDiscountFunction(dbShop.api(), metafields)
      console.log('automaticDiscount', automaticDiscount)
      await ShopifyToken.q.update({ discountId: automaticDiscount.discountId }).where({ id: dbShop.id })
    }
    console.log('updated')
    return validation
  } else {
    console.log('Input was not valid')
    return validation
  }
}

function validateSettings(settings) {
  const validation = { validCartMinimum: true, validDiscountPercentage: true, valid: true }
  const cartMinimumInteger = parseInt(settings.cartMinimum)
  const discountPercentageInteger = parseInt(settings.discountPercentage)
  if (isNaN(cartMinimumInteger) || settings.cartMinimum % 1 != 0 || cartMinimumInteger < 0) {
    console.log(`Minimum cart ${settings.cartMinimum} is not valid`)
    validation.validCartMinimum = false
    validation.valid = false
  }
  if (isNaN(discountPercentageInteger) || settings.discountPercentage % 1 != 0 || discountPercentageInteger < 0 || discountPercentageInteger > 100) {
    console.log(`Discount percentage ${settings.discountPercentage} is not valid`)
    validation.validDiscountPercentage = false
    validation.valid = false
  }
  return validation
}