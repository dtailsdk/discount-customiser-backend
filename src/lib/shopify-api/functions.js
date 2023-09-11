import { getEnvironment } from '@dtails/toolbox-backend'

export async function createDiscountFunction(shopifyApi, metafields) {
  const input = {
    automaticAppDiscount: {
      combinesWith: {
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: true
      },
      title: 'Tiered pricing',
      metafields: metafields,
      functionId: getEnvironment('SHOPIFY_TIERED_PRICING_ID'),
      startsAt: '2023-09-01T00:00:00'
    }
  }
  console.log('input', JSON.stringify(input, null, 2))
  const query = `mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
    discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
      automaticAppDiscount {
        discountId
      }
      userErrors {
        field
        message
      }
    }
  }
  `
  const result = await shopifyApi.runQuery(query, input)
  console.log('result', JSON.stringify(result, null, 2))
  if (result.discountAutomaticAppCreate.userErrors.length > 0) {
    console.error(`\n\nAn error occurred when trying to create discount function in Shopify: ${JSON.stringify(result.discountAutomaticAppCreate.userErrors)}\n\nquery: ${query}\n\ninput: ${JSON.stringify(input)}\n\n`)
    throw new Error(result.discountAutomaticAppCreate.userErrors)
  }
  return result.discountAutomaticAppCreate.automaticAppDiscount
}

export async function updateDiscountFunction(shopifyApi, id, cartMinimum, discountPercentage) {
  const input = {
    id: id,
    automaticAppDiscount: {
      combinesWith: {
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: true
      },
      title: 'Tiered pricing',
      functionId: getEnvironment('SHOPIFY_TIERED_PRICING_ID'),
      startsAt: '2023-09-01T00:00:00'
    }
  }
  console.log('input', JSON.stringify(input, null, 2))
  const query = `mutation discountAutomaticAppUpdate($automaticAppDiscount: DiscountAutomaticAppInput!, $id: ID!) {
    discountAutomaticAppUpdate(automaticAppDiscount: $automaticAppDiscount, id: $id) {
      automaticAppDiscount {
        discountId
      }
      userErrors {
        field
        message
      }
    }
  }  
  `
  const result = await shopifyApi.runQuery(query, input)
  console.log('result', JSON.stringify(result, null, 2))
  if (result.discountAutomaticAppUpdate.userErrors.length > 0) {
    console.error(`\n\nAn error occurred when trying to create discount function in Shopify: ${JSON.stringify(result.discountAutomaticAppUpdate.userErrors)}\n\nquery: ${query}\n\ninput: ${JSON.stringify(input)}\n\n`)
    throw new Error(result.discountAutomaticAppUpdate.userErrors)
  }
  return result.discountAutomaticAppUpdate
}
