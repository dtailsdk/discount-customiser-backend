import { Server } from '@dtails/toolbox-backend'
import { getInstalledShop, updateShop } from '../lib/shop-service'

//Service that does not require authorization used to decide whether to start OAuth flow for shops where app is not installed yet
async function get(req, res) {
  const dbShopName = req.query.shop.replace('.myshopify.com', '')
  const shopState = await getInstalledShop(dbShopName)
  return res.send(shopState)
}

async function put(req, res) {
  const dbShop = req.shopFromToken
  const shopState = await updateShop(dbShop, req.body.showSetupInstructions)
  return res.send(shopState)
}

async function ping(req, res) {
  console.log('Ping!')
  return res.send('Pong')
}

export default function init(shopifyOAuth) {
  const router = Server.Router()

  router
    .route('/')
    .get(get)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/her')
    .put(shopifyOAuth.withAuthorizedShop(), put)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/ping')
    .get(ping)
    .all(Server.middleware.methodNotAllowed)

  return router
}