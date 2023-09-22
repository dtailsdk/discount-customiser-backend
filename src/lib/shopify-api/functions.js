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
  if (result.discountAutomaticAppCreate.userErrors.length > 0) {
    console.error(`\n\nAn error occurred when trying to create discount function in Shopify: ${JSON.stringify(result.discountAutomaticAppCreate.userErrors)}\n\nquery: ${query}\n\ninput: ${JSON.stringify(input)}\n\n`)
    throw new Error(result.discountAutomaticAppCreate.userErrors)
  }
  return result.discountAutomaticAppCreate.automaticAppDiscount
}

export async function getDiscountFunction(shopifyApi, discountNodeId) {
  const query = `query {
    discountNode(id: "${discountNodeId}") {
      id
      discount {
        __typename
        ... on DiscountAutomaticApp {
          status
          title
        }
      }
      metafields(first: 10) {
        edges {
          node {
            id
            key
            namespace
            value
          }
        }
      }
    }
  }
  `
  const result = await shopifyApi.runQuery(query)
  return result.discountNode
}

export async function getDiscountFunctions(shopifyApi) {
  const query = `{
    discountNodes(first: 100) {
      edges {
        node {
          id
          discount {
            __typename
            ... on DiscountAutomaticApp {
              status
              title
            }
          }
          metafields(first: 3) {
            edges {
              node {
                id
                key
                namespace
                value
              }
            }
          }
        }
      }
    }
  }  
  `
  const result = await shopifyApi.runQuery(query)
  return result.discountNodes
}
