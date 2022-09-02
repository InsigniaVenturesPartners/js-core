import config from 'config-yml'
import SecretManager from '../services/secret-manager'
import { logInfo } from '../helpers/print-log'

class Secret {
  constructor () {
    // eslint-disable-next-line no-extra-boolean-cast
    if (!!Secret.instance) return Secret.instance

    Secret.instance = this.initialize()

    return Secret.instance
  }

  async initialize () {
    const conf = config.load(process.env.STAGE)
    const secretKeyToPathObj = conf.SECRET_KEY_TO_PATH || {}

    const secretManager = new SecretManager()
    for (const secretKey of Object.keys(secretKeyToPathObj)) {
      logInfo(`Loading '${secretKey}' secret`)
      const secretPath = secretKeyToPathObj[secretKey]
      this[secretKey] = await secretManager.getSecret(secretPath)
    }

    return this
  }
}

export default Secret
