export async function createWebhook(shopifyApi, input) {
  const createWebhookInput = { topic: input.topic, webhookSubscription: input.webhookSubscription }
  const query = `mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
      userErrors {
        field
        message
      }
      webhookSubscription {
        id
      }
    }
  }`
  const result = await shopifyApi.runQuery(query, createWebhookInput)
  if (result.webhookSubscriptionCreate.userErrors.length > 0) {
    console.error(`\n\nAn error occurred when trying to create webhook in Shopify: ${JSON.stringify(result.webhookSubscriptionCreate.userErrors)}\n\nquery: ${query}\n\ninput: ${JSON.stringify(createWebhookInput)}\n\n`)
    throw new Error(result.webhookSubscriptionCreate.userErrors)
  }
  return result.webhookSubscriptionCreate
}

export async function getWebhooks(shopifyApi) {
  const query = `{
    webhookSubscriptions(first:10) {
      edges {
        node {
          topic
        }
      }
    }
  }`
  const result = await shopifyApi.runQuery(query)
  return result.webhookSubscriptions.edges
}

export async function deleteWebhook(shopifyApi, webhookId) {
  const input = { id: webhookId }
  const query = `mutation webhookSubscriptionDelete($id: ID!) {
    webhookSubscriptionDelete(id: $id) {
      userErrors {
        field
        message
      }
    }
  }
  `
  const result = await shopifyApi.runQuery(query, input)
  return result.webhookSubscriptionDelete
}