import { Server } from '@dtails/toolbox-backend'

async function get(req, res) {
  const dbShop = req.shopFromToken
  return res.send({
    enabled: true,
    cartMinimum: '345.75',
    discountPercentage: '15'
  })
}

async function post(req, res) {
  const dbShop = req.shopFromToken
  return res.send(req.body)
}

async function ping(req, res) {
  console.log('Ping!')
  return res.send('Pong')
}

export default function init(shopifyOAuth) {
  const router = Server.Router()

  router
    .route('/')
    .get(shopifyOAuth.withAuthorizedShop(), get)
    .post(shopifyOAuth.withAuthorizedShop(), post)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/ping')
    .get(ping)
    .all(Server.middleware.methodNotAllowed)

  return router
}