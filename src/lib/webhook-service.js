import * as Sentry from "@sentry/node"
import crypto from 'crypto'
import { getEnvironment } from '@dtails/toolbox-backend'
import { ShopifyToken } from 'models'
import { createWebhook, getWebhooks, deleteWebhook } from './shopify-api/webhooks'

export async function validateWebhooks(dbShop) {
  console.log(`Going to validate webhooks for shop ${dbShop.shop}`)
  const appWebhooks = [
    { topic: 'APP_UNINSTALLED', webhookSubscription: { callbackUrl: getEnvironment('SERVER_URL') + '/app/webhooks/app_uninstalled' } },
  ]

  const webhooks = await getWebhooks(dbShop.api())
  for (let i = 0; i < appWebhooks.length; i++) {
    let webhookIsCreated = false
    for (let j = 0; j < webhooks.length; j++) {
      const webhook = webhooks[j]

      if (webhook.topic == appWebhooks[i].topic) {
        if (webhook.callbackUrl == appWebhooks[i].webhookSubscription.callbackUrl) {
          console.log('Webhook with topic ' + appWebhooks[i].topic + ' and endpoint ' + appWebhooks[i].webhookSubscription.callbackUrl + ' was already installed')
          webhookIsCreated = true
          break
        } else {
          await deleteWebhook(dbShop.api(), webhook.id)
        }
      }
    }
    if (!webhookIsCreated) {
      console.log('Webhook with topic ' + appWebhooks[i].topic + ' was not installed - going to (re)install webhook')
      await createWebhook(dbShop.api(), appWebhooks[i])
    }
  }
}

export function verifyShopifyWebhook(secret, req, body) {
  try {
    var digest = crypto.createHmac('SHA256', secret)
      .update(new Buffer.from(body, 'utf8'))
      .digest('base64')
    return digest === req.headers['x-shopify-hmac-sha256'];
  } catch (error) {
    console.log(error, req.body)
    return false
  }
}

/**
 * Validates webhooks for all installed shops
 */
export async function validateAllWebhooks() {
  const dbShops = await ShopifyToken.q
  console.log(`Found ${dbShops.length} shops to validate`)
  for (let i = 0; i < dbShops.length; i++) {
    const dbShop = dbShops[i]
    try {
      await validateWebhooks(dbShop)
    } catch (e) {
      console.log(e)
      Sentry.captureException(e)
    }
  }
}

export async function getShopifyWebhooks() {
  const dbShops = await ShopifyToken.q
  console.log(`Going to get and log webhooks for ${dbShops.length} shops`)
  for (const dbShop of dbShops) {
    const webhooks = await getWebhooks(dbShop.api())
    const displayWebhooks = webhooks.map(wrappedWebhook => wrappedWebhook.node.topic + ' ' + wrappedWebhook.node.endpoint.callbackUrl)
    console.log(`The store ${dbShop.shop} has ${webhooks.length} webhooks\r\n${displayWebhooks.join('\r\n')}`)
  }
}