import { Server } from '@dtails/toolbox-backend'
import { updateSettings, getSettings } from '../lib/settings-service'

async function get(req, res) {
  console.log('hello???')
  const dbShop = req.shopFromToken
  console.log('going to get settings')
  await getSettings(dbShop)
  return res.send({
    enabled: true,
    cartMinimum: '345.75',
    discountPercentage: '15'
  })
}

async function post(req, res) {
  const dbShop = req.shopFromToken
  const validation = await updateSettings(dbShop, req.body)
  console.log('validation', validation)
  if (validation.valid) {
    return res.send(req.body)
  }
  return res.status(400).send(validation)
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
    .put(shopifyOAuth.withAuthorizedShop(), post)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/ping')
    .get(ping)
    .all(Server.middleware.methodNotAllowed)

  return router
}