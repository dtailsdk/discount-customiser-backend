export async function updateMetafield(shopifyApi, metafields) {
  const input = { metafields }
  const query = `mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
      }
      userErrors {
        field
        message
      }
    }
  }`
  const result = await shopifyApi.runQuery(query, input)
  if (result.metafieldsSet.userErrors.length > 0) {
    console.error(`\n\nAn error occurred when trying to update metafield in Shopify: ${JSON.stringify(result.metafieldsSet.userErrors)}\n\nquery: ${query}\n\ninput: ${JSON.stringify(input)}\n\n`)
    throw new Error(result.metafieldsSet.userErrors)
  }
  console.log('result', JSON.stringify(result, null, 2))
  return result.metafieldsSet.metafields
}

export async function getPrivateMetafields(shopifyApi, ownerId) {
  console.log(ownerId)
  const query = `query{
    privateMetafields(owner: "${ownerId}", first:10){
      edges{
        node{
          id
        }
      }
    }
  }`
  const result = await shopifyApi.runQuery(query)
  return result.privateMetafields.edges
}

export async function getMetafield(shopifyApi, ownerId) {
  console.log(ownerId)
  const query = `query{
    privateMetafields(owner: "${ownerId}", first:10){
      edges{
        node{
          id
        }
      }
    }
  }`
  const result = await shopifyApi.runQuery(query)
  return result.privateMetafields.edges
}