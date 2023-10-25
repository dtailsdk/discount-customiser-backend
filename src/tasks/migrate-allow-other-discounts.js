import { Server, Model } from '@dtails/toolbox-backend'
import { migrateAllowOtherDiscounts } from '../lib/settings-service'

Server.init({ withCors: false })
Server.initModel(Model, { debug: false })

migrateAllowOtherDiscounts().catch(e => {
  console.error('An error occurred in the task that updates the function to allow for other discounts', e)
  process.exit(1)
}).then(_ => process.exit(0))