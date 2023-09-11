import { Server, Model } from '@dtails/toolbox-backend'
import { validateAllWebhooks } from '../lib/webhook-service'

Server.init({ withCors: false })
Server.initModel(Model, { debug: false })

validateAllWebhooks().catch(e => {
  console.error('An error occurred in the task that validates webhooks for all shops', e)
  process.exit(1)
}).then(_ => process.exit(0))