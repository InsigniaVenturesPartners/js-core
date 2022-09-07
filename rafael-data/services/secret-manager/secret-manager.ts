import * as AWS from 'aws-sdk'
import { logDanger } from "@insigniateam/helpers.print-log";

class SecretManager {
  private secretManager

  constructor (region = null) {
    this.secretManager = new AWS.SecretsManager({
      region: region || process.env.DEFAULT_AWS_REGION || 'ap-southeast-1'
    })
  }

  async getSecret (secretPath, secretVarName = null) {
    return new Promise((resolve, reject) => {
      this.secretManager.getSecretValue({ SecretId: secretPath }, function (err, data) {
        if (err) {
          logDanger('Cannot get secret from AWS secret manager')
          reject(err)
        }

        let secret
        if (data.SecretString) {
          secret = data.SecretString
        } else {
          let buff = Buffer.from(data.SecretBinary, 'base64')
          secret = buff.toString('ascii')
        }

        const secretObj = JSON.parse(secret.toString('utf-8'))

        resolve(secretVarName ? secretObj[secretVarName] : secretObj)
      })
    })
  }
}

export default SecretManager
