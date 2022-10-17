import config from 'config-yml'
import SecretManager from '@insigniateam/rafael-data.services.secret-manager'
import { logInfo } from '@insigniateam/helpers.print-log'

export default class Secret {
  private static instance
  public data: Record<string, any> = {}

  constructor () {
    // eslint-disable-next-line no-extra-boolean-cast
    if (!!Secret.instance) return Secret.instance

    Secret.instance = this.initialize()

    return Secret.instance
  }

  private async initialize () {
    const conf = config.load(process.env.STAGE)
    const secretKeyToPathObj = conf.SECRET_KEY_TO_PATH || {}

    const secretManager = new SecretManager()
    for (const secretKey of Object.keys(secretKeyToPathObj)) {
      logInfo(`Loading '${secretKey}' secret`)
      const secretPath = secretKeyToPathObj[secretKey]
      this.data[secretKey] = await secretManager.getSecret(secretPath)
    }

    return this
  }
}
