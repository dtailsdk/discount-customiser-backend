import { Settings } from 'models'
import { createDiscountFunction, getDiscountFunction, getDiscountFunctions } from './shopify-api/functions'
import { updateMetafield } from './shopify-api/metafields'

export const METAFIELD_NAMESPACE = 'dtails'
export const MINIMUM_CART_METAFIELD_KEY = 'cart_minimum'
export const DISCOUNT_METAFIELD_KEY = 'discount_percentage'

export async function getSettings(dbShop) {
  let dbSettings = await Settings.q.findOne({ shopifyTokenId: dbShop.id })
  const settings = {
    cartMinimum: 0,
    discountPercentage: 0,
  }
  if (dbSettings) {
    if (dbSettings.shopifyDiscountId) {
      const discountFunction = await getDiscountFunction(dbShop.api(), dbSettings.shopifyDiscountId)
      settings.cartMinimum = discountFunction.metafields.filter(field => field.key == MINIMUM_CART_METAFIELD_KEY)[0].value
      settings.discountPercentage = discountFunction.metafields.filter(field => field.key == DISCOUNT_METAFIELD_KEY)[0].value
    }
  } else {
    await Settings.q.insert({
      shopifyTokenId: dbShop.id,
    })
  }
  return settings
}

export async function updateSettings(dbShop, settings) {
  const validation = validateSettings(settings)
  if (validation.valid) {
    const automaticDiscount = await getAutomaticDiscount(dbShop)
    console.log('found automatic discount', automaticDiscount)
    await Settings.q.update({ shopifyDiscountId: automaticDiscount.id }).where({ shopifyTokenId: dbShop.id })
    const metafields = [
      {
        ownerId: automaticDiscount.id,
        key: MINIMUM_CART_METAFIELD_KEY,
        namespace: METAFIELD_NAMESPACE,
        type: 'number_integer',
        value: settings.cartMinimum
      },
      {
        ownerId: automaticDiscount.id,
        key: DISCOUNT_METAFIELD_KEY,
        namespace: METAFIELD_NAMESPACE,
        type: 'number_integer',
        value: settings.discountPercentage
      }
    ]
    await updateMetafield(dbShop.api(), metafields)
    /*
    else {
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
      await Settings.q.update({ shopifyDiscountId: automaticDiscount.discountId }).where({ id: dbSettings.id })
    }
*/
    return validation
  } else {
    console.log('Input was not valid', validation)
    return validation
  }
}

async function getAutomaticDiscount(dbShop) {
  const automaticDiscounts = await getDiscountFunctions(dbShop.api())
  console.log('automaticDiscounts', JSON.stringify(automaticDiscounts, null, 2))
  for (const automaticDiscount of automaticDiscounts) {
    console.log('automatic discount iteration', JSON.stringify(automaticDiscount, null, 2))
    if (automaticDiscount.discount.__typename == 'DiscountAutomaticApp' && automaticDiscount.discount.title == 'Tiered pricing' && automaticDiscount.metafields.length > 0 && automaticDiscount.metafields[0].namespace == METAFIELD_NAMESPACE) {
      return automaticDiscount
    }
  }
  return null
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