import { Model } from '@dtails/toolbox-backend'

class Settings extends Model {
  static tableName = 'settings'
  static hasTimestamps = true
  static hasUser = false
}

export default Settings
