import axios from 'axios'
import { delay } from '@dtails/common'

export async function createProductInShopify(shopifyApi, shopifyProduct) {
  const input = {input: shopifyProduct}
  const query = `mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        name
        status
        metafields
      }
      shop {
        id
      }
      userErrors {
        field
        message
      }
    }
  }`
  const result = await shopifyApi.graphql(query, input)
  if (result.productCreate.userErrors.length > 0){
    console.error('An error occurred when trying to create product in Shopify', result.productCreate.userErrors)
    throw new Error(result.productCreate.userErrors)
  }
  return result.productCreate.product
}

export async function updateProductInShopify(shopifyApi, shopifyProduct) {
  const input = {input: shopifyProduct}
  const query = `mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        name
        status
        metafields
      }
      userErrors {
        field
        message
      }
    }
  }`
  const result = await shopifyApi.graphql(query, input)
  if (result.productUpdate.userErrors.length > 0){
    if (result.productUpdate.userErrors.length == 1 && result.productUpdate.userErrors[0].message == 'Key must be unique within this namespace on this resource'){
      console.log('Ignoring known Shopify bug (an error is returned even though product is successfully updated)', JSON.stringify(result.productUpdate.userErrors))
    }else{
      console.error(`\n\nAn error occurred when trying to update product in Shopify: ${JSON.stringify(result.productUpdate.userErrors)}\n\nquery: ${query}\n\ninput: ${JSON.stringify(input)}\n\n`)
      throw new Error(result.productUpdate.userErrors)
    }
  }
  return result.productUpdate.product
}

export async function deleteProductInShopify(shopifyApi, shopifyProductId) {
  const input = {input: {id: shopifyProductId}}
  const query = `mutation productDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      shop {
        id
      }
      userErrors {
        field
        message
      }
    }
  }`
  const result = await shopifyApi.graphql(query, input)
  if (result.productDelete.userErrors.length > 0){
    console.error('An error occurred when trying to delete product in Shopify', result.productDelete.userErrors)
    throw new Error('An error occurred when trying to delete product in Shopify', result.productDelete.userErrors)
  }
  return result.productDelete.deletedProductId
}

export async function getMetafields(shopifyApi, productId, namespace) {
  const query = `{
    product(id: "${productId}") {
      metafields(first: 5, namespace: "${namespace}") {
        edges {
          node {
            id
            key
            value
          }
        }
      }
    }
  }
  `
  const result = await shopifyApi.graphql(query)
  return result.product
}

export async function deleteMetafield(shopifyApi, id) {
  const input = {input: {id: id}}
  const query = `mutation metafieldDelete($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }`
  const result = await shopifyApi.graphql(query, input)
  if (result.metafieldDelete.userErrors.length > 0){
    console.error('An error occurred when trying to delete metafield in Shopify', result.metafieldDelete.userErrors)
    throw new Error(result.metafieldDelete.userErrors)
  }
  return result.deletedId
}

export async function getProductPreviewUrl(shopifyApi, productId) {
  const query = `{
    product(
      id: "${productId}"
    ) {
      onlineStorePreviewUrl
    }
  }`
  const result = await shopifyApi.graphql(query)  
  return result
}

export async function getShopifyProducts(shopifyApi) {
  const query = `mutation {
    bulkOperationRunQuery(
      query: """
      {
        products {
          edges {
            node {
              id
              title
            }
          }
        }
      }
      
      """
    )  {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }`
  await shopifyApi.graphql(query)
  let queryUrl = null
  while (!queryUrl) {
    queryUrl = await getBulkOperation(shopifyApi)
    console.log('Querying bulk job status')
    await delay(2000)
  }
  if (queryUrl == 'N/A') {
    return null
  }
  const result = await axios.get(queryUrl)
  return result.data
}

export async function getBulkOperation(shopifyApi) {
  const query = `query {
    currentBulkOperation {
      id
      status
      errorCode
      createdAt
      completedAt
      objectCount
      fileSize
      url
      partialDataUrl
    }
  }`
  
  const bulkOperation = await shopifyApi.graphql(query)
  if (bulkOperation.currentBulkOperation.status == 'COMPLETED') {
    if (!bulkOperation.currentBulkOperation.url) {
      return 'N/A'
    }
    return bulkOperation.currentBulkOperation.url
  }
  if (bulkOperation.currentBulkOperation.status == 'FAILED') {
    return 'N/A'
  }
  return null
}