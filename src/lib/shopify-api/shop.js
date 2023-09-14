export async function getShopDetails(shopifyApi) {
  const query = `{
    shop {
      plan {
        displayName
        partnerDevelopment
        shopifyPlus
      }
      currencyCode
    }
  }`
  const result = await shopifyApi.runQuery(query)
  return result.shop
}