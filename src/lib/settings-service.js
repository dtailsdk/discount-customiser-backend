import { Settings } from 'models'
import { getDiscountFunction, getDiscountFunctions, createDiscountFunction } from './shopify-api/functions'
import { updateMetafield } from './shopify-api/metafields'

export const METAFIELD_NAMESPACE = 'dtails'
export const MINIMUM_CART_METAFIELD_KEY = 'cart_minimum'
export const DISCOUNT_METAFIELD_KEY = 'discount_percentage'
const AUTOMATIC_DISCOUNT_TYPE = 'DiscountAutomaticApp'
const AUTOMATIC_DISCOUNT_TITLE = 'Tiered pricing'

export async function getSettings(dbShop) {
  const dbSettings = await Settings.q.findOne({ shopifyTokenId: dbShop.id })
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

/**
 * There seems to be something buggy about discount functions - sometimes the automatic discount already exist
 * after install, and sometimes it does not.
 * The code below handles both cases
 */
export async function updateSettings(dbShop, settings) {
  const validation = validateSettings(settings)
  if (validation.valid) {
    let automaticDiscountId = null
    const dbSettings = await Settings.q.findOne({ shopifyTokenId: dbShop.id })
    if (dbSettings.shopifyDiscountId == null) {
      let automaticDiscount = await getAutomaticDiscount(dbShop)
      console.log('automaticDiscount', automaticDiscount)
      if (automaticDiscount == null) {
        console.log('The automatic discount does not exist - going to create automatic discount')
        const metafields = [
          {
            description: 'Minimum cart value to enable discount percentage to be applied',
            key: MINIMUM_CART_METAFIELD_KEY,
            namespace: METAFIELD_NAMESPACE,
            type: 'number_integer',
            value: settings.cartMinimum
          },
          {
            description: 'Discount percentage to apply if minimum cart amountis met',
            key: DISCOUNT_METAFIELD_KEY,
            namespace: METAFIELD_NAMESPACE,
            type: 'number_integer',
            value: settings.discountPercentage
          }
        ]
        automaticDiscount = await createDiscountFunction(dbShop.api(), metafields)
        automaticDiscountId = automaticDiscount.discountId
      } else {
        console.log('The automatic discount exists - going to update metafield values')
        automaticDiscountId = automaticDiscount.id
        await updateDiscountMetafields(dbShop, automaticDiscountId, settings)
      }
      console.log('Going to persist automatic discount id')
      await Settings.q.update({ shopifyDiscountId: automaticDiscountId }).where({ shopifyTokenId: dbShop.id })
    } else {
      console.log('The automatic discount exists and id was already persisted - going to update metafield values')
      automaticDiscountId = dbSettings.shopifyDiscountId
      await updateDiscountMetafields(dbShop, automaticDiscountId, settings)
    }
    return validation
  } else {
    console.log('Input was not valid', validation)
    return validation
  }
}

async function updateDiscountMetafields(dbShop, automaticDiscountId, settings) {
  const metafields = [
    {
      ownerId: automaticDiscountId,
      key: MINIMUM_CART_METAFIELD_KEY,
      namespace: METAFIELD_NAMESPACE,
      type: 'number_integer',
      value: settings.cartMinimum
    },
    {
      ownerId: automaticDiscountId,
      key: DISCOUNT_METAFIELD_KEY,
      namespace: METAFIELD_NAMESPACE,
      type: 'number_integer',
      value: settings.discountPercentage
    }
  ]
  await updateMetafield(dbShop.api(), metafields)
}

async function getAutomaticDiscount(dbShop) {
  const automaticDiscounts = await getDiscountFunctions(dbShop.api())
  for (const automaticDiscount of automaticDiscounts) {
    if (automaticDiscount.discount.__typename == AUTOMATIC_DISCOUNT_TYPE && automaticDiscount.discount.title == AUTOMATIC_DISCOUNT_TITLE && automaticDiscount.metafields.length > 0 && automaticDiscount.metafields[0].namespace == METAFIELD_NAMESPACE) {
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