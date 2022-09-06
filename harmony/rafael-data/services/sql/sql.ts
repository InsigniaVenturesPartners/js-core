import { Pool } from 'pg'
import { logDanger, logInfo, logMagenta } from '@insigniateam/helpers.print-log'

export class Sql {
  static connectToDb () {
    return new Pool({
      host: process.env.PSQL_HOST,
      database: process.env.PSQL_DB,
      user: process.env.PSQL_USER,
      password: process.env.PSQL_PWD,
      port: process.env.PSQL_PORT
    })
  }

  static async execute (query, params = []) {
    const db = this.connectToDb()

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
