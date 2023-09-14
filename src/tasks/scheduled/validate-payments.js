import { Server, Model } from '@dtails/toolbox-backend'
import { validateAllPaymentSubscriptions } from '../../lib/billing-service'

Server.init({ withCors: false })
Server.initModel(Model, { debug: false })

validateAllPaymentSubscriptions().catch(e => {
  console.error("An error occurred in the task that validates the payments for all shops", e)
  process.exit(1)
}).then(_ => process.exit(0))