import { Server } from '@dtails/toolbox-backend'
import { getEnvironment } from '@dtails/toolbox-backend'
import { verifyShopifyWebhook } from '../lib/webhook-service'
import { sendCustomerDataMail } from '../lib/mail-service'
import { deleteShopData } from '../lib/shop-service'
import { ShopifyToken } from 'models'

async function appUninstalled(req, res) {
  try {
    const shop = await verifyWebhook(req, req.rawBody)
    console.log('On uninstall, DB shop is ', shop, req.headers['x-shopify-shop-domain'])
    await deleteShopData(shop)
    return res.sendStatus(200)
  } catch (error) {
    return res.sendStatus(401)
  }
}

async function redactShopDataRequested(req, res) {
  try {
    const shop = await verifyWebhook(req, req.rawBody)
    console.log('On shop redact request, DB shop is ', shop, req.headers['x-shopify-shop-domain'])
    await deleteShopData(shop)
    return res.sendStatus(200)
  } catch (error) {
    return res.sendStatus(401)
  }
}

async function customersRedact(req, res) {
  try {
    const shop = await verifyWebhook(req, req.rawBody)
    console.log('Customers redact requested for customer, DB shop is ', shop.id, req.headers['x-shopify-shop-domain'])
    return res.sendStatus(200)
  } catch (error) {
    return res.sendStatus(401)
  }
}

async function customersDataRequest(req, res) {
  try {
    const shop = await verifyWebhook(req, req.rawBody)
    console.log('Customer data requested for customer, DB shop is ', shop.id, req.headers['x-shopify-shop-domain'])
    await sendCustomerDataMail(shop.id)
    return res.sendStatus(200)
  } catch (error) {
    return res.sendStatus(401)
  }
}

async function verifyWebhook(req, rawBody) {
  const fullShopName = req.headers['x-shopify-shop-domain']
  console.log('App webhook ' + req.headers['x-shopify-topic'] + ' called for shop ' + fullShopName)
  if (!verifyShopifyWebhook(getEnvironment('SHOPIFY_API_SECRET'), req, rawBody)) {
    throw new Error('Webhook was not verified')
  }
  const shopName = fullShopName.split('.')[0]
  return await ShopifyToken.q.where({ shop: shopName }).first()
}

async function ping(req, res) {
  console.log('Ping!')
  return res.send('Pong')
}

export default function init(shopifyOAuth) {
  const router = Server.Router()

  router
    .route('/app_uninstalled')
    .post(appUninstalled)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/customers_redact')
    .post(customersRedact)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/customers_data_request')
    .post(customersDataRequest)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/shop_redact')
    .post(redactShopDataRequested)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/ping')
    .get(ping)
    .all(Server.middleware.methodNotAllowed)

  return router
}