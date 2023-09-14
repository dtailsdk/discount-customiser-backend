export async function getActiveSubscriptions(shopifyApi) {
  const query = `{
    appInstallation {
      activeSubscriptions {
        id
        name
        status
      }
    }
  }`
  const response = await shopifyApi.runQuery(query)
  return response.appInstallation.activeSubscriptions
}

export async function createSubscription(shopifyApi, displayName, lineItems, approvalRedirectUrl, isTestEnvironment) {
  const input = { name: displayName, lineItems: lineItems, returnUrl: approvalRedirectUrl, trialDays: 7, test: isTestEnvironment }
  const query = `mutation($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int!, $test: Boolean) {
    appSubscriptionCreate(name: $name, lineItems: $lineItems, returnUrl: $returnUrl, trialDays: $trialDays, test: $test){
      appSubscription {
          id
      }
      confirmationUrl
      userErrors {
          field
          message
      }
    }
  }`
  const response = await shopifyApi.runQuery(query, input)
  return response.appSubscriptionCreate
}

export async function cancelSubscription(shopifyApi, subscriptionId) {
  const input = { id: subscriptionId }
  const query = `mutation ($id: ID!) {
      appSubscriptionCancel(id: $id) {
          appSubscription {
              id
          }
      userErrors {
          field
          message
      }
    }
  }`
  const response = await shopifyApi.runQuery(query, input)
  return response
}