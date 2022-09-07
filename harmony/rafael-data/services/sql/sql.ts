import { Pool } from 'pg'
import { logDanger, logInfo, logMagenta } from '@insigniateam/helpers.print-log'
import Secret from "@insigniateam/rafael-data.secret"

export default class Sql {
  static async connectToDb () {
    const isDev = process.env.STAGE === 'dev'
    const secret = await new Secret()
    return new Pool({
      database: process.env.PSQL_DB,
      host: isDev ? process.env.PSQL_HOST : secret.data.db.host,
      user: isDev ? process.env.PSQL_USER : secret.data.db.username,
      password: isDev ? process.env.PSQL_PWD : secret.data.db.password,
      port: isDev ? process.env.PSQL_PORT : secret.data.db.port
    })
  }

  static async execute (query, params = []) {
    const db = await this.connectToDb()

    params = Array.isArray(params) ? params : [params]

    return db.query(query, params).then(value => {
      db.end()
      if (process.env.DB_DEBUG === 'true') {
        logInfo('Running Query:')
        logMagenta(query)
        logMagenta(`Params: ${JSON.stringify(params)}`)
        logInfo(`${value.rows.length} rows returned.`)
      }
      return value.rows
    }).catch((err) => {
      db.end()

      logDanger('Error When Running Query:')
      logMagenta(query)
      logMagenta(`Params: ${JSON.stringify(params)}`)

      const errMsg = `[SQL Error] ${err.message}. Query: ${query}. Params: ${JSON.stringify(params)}`
      logDanger(errMsg)
      throw new Error(errMsg)
    })
  }
}
