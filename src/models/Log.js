import { Model } from '@dtails/toolbox-backend'

class Log extends Model {
  static tableName = 'logs'
  static hasTimestamps = true
  static hasUser = false
}

export default Log
