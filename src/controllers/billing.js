import { Server } from '@dtails/toolbox-backend'
import { createShopifySubscription, approveSubscription } from '../lib/billing'

async function createRequestedSubscription(req, res) {
  const shop = req.shopFromToken
  const redirectUrl = await createShopifySubscription(shop)
  return res.send({ redirect_to_url: redirectUrl })
}

//Callback from Shopify when merchant has approved app payment
async function approve(req, res) {
  const chargeId = req.query.charge_id
  const redirectUrl = await approveSubscription(chargeId)
  return res.redirect(redirectUrl)
}

async function ping(req, res) {
  console.log('Ping!')
  return res.send('Pong')
}

export default function init(shopifyOAuth) {
  const router = Server.Router()

  router
    .route('/approve')
    .get(approve)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/')
    .post(shopifyOAuth.withAuthorizedShop(), createRequestedSubscription)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/ping')
    .get(ping)
    .all(Server.middleware.methodNotAllowed)

  return router
}