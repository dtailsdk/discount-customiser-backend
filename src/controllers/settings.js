import { Server } from '@dtails/toolbox-backend'
import { updateSettings, getSettings } from '../lib/settings-service'

async function get(req, res) {
  const dbShop = req.shopFromToken
  const dbSettings = await getSettings(dbShop)
  return res.send(dbSettings)
}

async function put(req, res) {
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
    .put(shopifyOAuth.withAuthorizedShop(), put)
    .all(Server.middleware.methodNotAllowed)

  router
    .route('/ping')
    .get(ping)
    .all(Server.middleware.methodNotAllowed)

  return router
}