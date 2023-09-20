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

export async function getDiscountFunctions(shopifyApi, discountNodeId) {
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
