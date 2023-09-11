import Shopify from 'shopify-api-node'

export function getApiConnection(token) {
  const shopify = new Shopify({
    shopName: token.shop,
    accessToken: token.token,
    apiVersion: '2021-04',
  })
  return shopify
}