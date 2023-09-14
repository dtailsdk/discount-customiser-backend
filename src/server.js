import * as Sentry from "@sentry/node"; 
import { Server, Model, ShopifyOAuth } from '@dtails/toolbox-backend'
import { getEnvironment } from '@dtails/toolbox-backend'
import {
  ShopifyToken
} from 'models'
import uuidv4 from 'uuid/v4'
import { validateWebhooks } from './lib/webhook-service'
import { getAppScopes } from './lib/shop-service'

Server.init({
  withCors: true,
  credentials: true,
  corsBlacklist: ['/', '/app/shopify/auth/confirm', '/app/webhooks/app_uninstalled', '/app/webhooks/customers_redact', '/app/webhooks/customers_data_request', '/app/webhooks/shop_redact', '/favicon.ico'],
  bodyParser: {
    parseRawBody: true,
    rawBodyUrls: ['/app/webhooks/app_uninstalled', '/app/webhooks/shop_redact', '/app/webhooks/customers_redact', '/app/webhooks/customers_data_request'],
    type: ['text/plain', 'application/json']
  }
})

const knex_debug_mode = getEnvironment('KNEX_DEBUG_MODE') === 'true'
Server.initModel(Model, { debug: knex_debug_mode })

//Shopify GraphQL bug requires write_orders for webhooks ORDER_CREATED etc.
const shopifyOAuth = new ShopifyOAuth({
  key: getEnvironment('SHOPIFY_API_KEY'),
  secret: getEnvironment('SHOPIFY_API_SECRET'),
  tokenModel: ShopifyToken,
  knex_debug_mode,
  models: [],
  tenant_migrations: [],
  scope: getAppScopes(),
  embedded: true,
  create_additional_token_data: token => ({ ...token, shoptimist_api_key: uuidv4() }),
  onShopInstalled: (shop) => { validateWebhooks(shop) },
})

shopifyOAuth.mount(Server, { redirectRoute: '/' })

//Do not do anything restricted here, as shop is only a query parameter (i.e. can be set by unauthorized users)
Server.get('/', async (req, res) => {
  console.log('Redirect from confirm step of OAuth flow for shop', req.query.shop)
  res.redirect(302, 'https://' + req.query.shop + '.myshopify.com/admin/apps/' + getEnvironment('SHOPIFY_APP_NAME'))
})

import controllers from 'controllers'
controllers(shopifyOAuth)

let sentryDSN = getEnvironment('SENTRY_DSN', false)
console.log(`Sentry error handling ${sentryDSN ? 'enabled' : 'disabled'}`)
if (sentryDSN) {
  Sentry.init({ dsn: sentryDSN });
  Server.use(Sentry.Handlers.requestHandler());
}

Server.listen()

Server.useNotFound()

if (sentryDSN) {
  Server.use(Sentry.Handlers.errorHandler());
}

Server.useErrorHandler()