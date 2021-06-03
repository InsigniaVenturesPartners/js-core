import Sql from '../services/sql'
import { snakeCase } from '../helpers/strings/caseConversion'

const SQL_SYNTAXES = ['now()']
export default class BaseQuery {
  constructor () {
    this.table = 'table_name'
    this.caseInsensitiveColumns = []
    this.softDeletes = false
    this.timestamps = true
  }

  async all (id) {
    let sql = `SELECT * FROM ${this.table} `
    if (this.softDeletes) sql += `WHERE deleted_at IS NULL `

    return (await Sql.execute(sql, []))
  }

  async findByID (id) {
    let sql = `SELECT * FROM ${this.table} WHERE id = $1 `
    if (this.softDeletes) sql += `AND deleted_at IS NULL `
    return (await Sql.execute(sql, [id]))[0]
  }

  async getBy (where = {}, limit = null) {
    const { whereQry, sqlParams } = this.buildWhereQryAndParams(where)

    let sql = `SELECT * FROM ${this.table} `
    if (whereQry.length > 0) sql += `WHERE ${whereQry.join(' AND ')} `
    if (this.softDeletes) sql += `AND deleted_at IS NULL `
    if (limit) sql += `LIMIT ${limit} `

    return Sql.execute(sql, sqlParams)
  }

  async findBy (params = {}) {
    return (await this.getBy(params, 1))[0] || null
  }

  async create (data = {}, { onConflictQry = null } = {}) {
    if (Object.keys(data).length <= 0) return null

    const columnNames = Object.keys(data).map(colName => snakeCase(colName))
    const sqlParams = Object.keys(data).map(columnName => data[columnName]) || []
    const bindingValues = Array.from(Array(sqlParams.length), (_, i) => `$${i + 1}`)
    if (!columnNames.includes('created_at') && this.timestamps) {
      columnNames.push('created_at')
      bindingValues.push('NOW()')
    }
    if (!columnNames.includes('updated_at') && this.timestamps) {
      columnNames.push('updated_at')
      bindingValues.push('NOW()')
    }
    let sql = `
      INSERT INTO ${this.table} (${columnNames.join(', ')})
      VALUES (${bindingValues.join(', ')}) 
    `
    if (onConflictQry) {
      sql += `ON CONFLICT ${onConflictQry} `
    }
    sql += `RETURNING * `

    return (await Sql.execute(sql, sqlParams))[0]
  }

  async update (id = null, updates = {}, where = {}) {
    const whereQry = []
    const sqlParams = []
    const updateColumnsQry = []
    Object.keys(updates).map(key => {
      const columnName = snakeCase(key)
      const value = updates[key]
      if (this.isSqlSyntax(value)) {
        updateColumnsQry.push(`"${columnName}" = ${value}`)
      } else {
        updateColumnsQry.push(`"${columnName}" = $${sqlParams.length + 1}`)
        sqlParams.push(value)
      }
    })

    if (id) {
      whereQry.push(`id = $${sqlParams.length + 1}`)
      sqlParams.push(id)
    } else if (Object.keys(where).length > 0) {
      this.buildWhereQryAndParams(where, whereQry, sqlParams)
    }

    if (updateColumnsQry.length === 0) return null

    let sql = `UPDATE ${this.table} `
    sql += `SET ${updateColumnsQry.join(', ')} `
    sql += `WHERE ${whereQry.join(' AND ')} `
    sql += `RETURNING *`

    return Sql.execute(sql, sqlParams)
  }

  async delete (id = null, where = {}) {
    const whereQry = []
    const sqlParams = []

    if (id) {
      whereQry.push(`id = $${sqlParams.length + 1}`)
      sqlParams.push(id)
    } else if (Object.keys(where).length > 0) {
      this.buildWhereQryAndParams(where, whereQry, sqlParams)
    }

    let sql
    if (this.softDeletes) {
      sql  = `UPDATE ${this.table} `
      sql += `SET deleted_at = NOW() `
      sql += `WHERE ${whereQry.join(' AND ')} `
      sql += `RETURNING *`
    } else {
      sql  = `DELETE FROM ${this.table} `
      sql += `WHERE ${whereQry.join(' AND ')} `
      sql += `RETURNING *`
    }

    return Sql.execute(sql, sqlParams)
  }

  buildWhereQryAndParams (where = {}, whereQry = [], sqlParams = []) {
    Object.keys(where).map(key => {
      const columnName = snakeCase(key)
      const isPresent = Array.isArray(where[key]) ? where[key].length > 0 : !!where[key]
      if (isPresent) {
        if (Array.isArray(where[key])) {
          whereQry.push(`"${columnName}" IN ('${where[key].map(val => String(val).split(`'`).join(`''`)).join(`', '`)}')`)
        } else {
          const operator = this.caseInsensitiveColumns.includes(columnName) ? 'ILIKE' : '='
          if (this.isSqlSyntax(where[key])) {
            whereQry.push(`"${columnName}" ${operator} ${where[key]}`)
          } else {
            whereQry.push(`"${columnName}" ${operator} $${sqlParams.length + 1}`)
            sqlParams.push(where[key])
          }
        }
      }
    })

    return { whereQry, sqlParams }
  }

  isSqlSyntax (value) {
    return SQL_SYNTAXES.includes(String(value).toLowerCase().trim())
  }
}
