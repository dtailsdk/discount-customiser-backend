import { Model } from '@dtails/toolbox-backend'

class VipMerchant extends Model {
  static tableName = 'vip_merchants'
  static hasTimestamps = true
  static hasUser = false
}

export default VipMerchant
