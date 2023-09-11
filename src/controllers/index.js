import { Server } from '@dtails/toolbox-backend'

import shopRouter from './shops'
import webhooksRouter from './webhooks'

export default function init(shopifyOAuth) {
  Server.use('/app/shops', shopRouter(shopifyOAuth))
  Server.use('/app/webhooks', webhooksRouter(shopifyOAuth))
}