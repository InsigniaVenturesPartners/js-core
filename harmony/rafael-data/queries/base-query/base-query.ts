import Sql from '@insigniateam/rafael-data.services.sql'
import { snakeCase } from '@insigniateam/helpers.case-conversion'

const SQL_SYNTAXES = ['now()']
export default class BaseQuery {
  protected table: string
  protected caseInsensitiveColumns: string[]
  protected softDeletes: boolean
  protected timestamps: boolean
  protected automaticTransformColumn: boolean
  protected createdAtColumn: string
  protected updatedAtColumn: string
  protected deletedAtColumn: string

  constructor () {
    this.table = 'table_name'
    this.caseInsensitiveColumns = []
    this.softDeletes = false
    this.timestamps = true
    this.automaticTransformColumn = true
    this.createdAtColumn = 'created_at'
    this.updatedAtColumn = 'updated_at'
    this.deletedAtColumn = 'deleted_at'
  }

  async all (id) {
    let sql = `SELECT * FROM "${this.table}" `
    if (this.softDeletes) sql += `WHERE "${this.deletedAtColumn}" IS NULL `

    return (await Sql.execute(sql, []))
  }

  async findByID (id) {
    let sql = `SELECT * FROM "${this.table}" WHERE id = $1 `
    if (this.softDeletes) sql += `AND "${this.deletedAtColumn}" IS NULL `
    return (await Sql.execute(sql, [id]))[0]
  }

  async getBy (where = {}, limit = null) {
    const { whereQry, sqlParams } = this.buildWhereQryAndParams(where)

    let sql = `SELECT * FROM "${this.table}" `
    if (whereQry.length > 0) sql += `WHERE ${whereQry.join(' AND ')} `
    if (this.softDeletes) sql += `AND "${this.deletedAtColumn}" IS NULL `
    if (limit) sql += `LIMIT ${limit} `

    return Sql.execute(sql, sqlParams)
  }

  async findBy (params = {}) {
    return (await this.getBy(params, 1))[0] || null
  }

  async create (data = {}, { onConflictQry = null } = {}) {
    if (Object.keys(data).length <= 0) return null

    const columnNames = Object.keys(data).map(colName => this.automaticTransformColumn ? snakeCase(colName) : colName)
    const sqlParams = Object.keys(data).map(columnName => data[columnName]) || []
    const bindingValues = Array.from(Array(sqlParams.length), (_, i) => `$${i + 1}`)
    if (!columnNames.includes(this.createdAtColumn) && this.timestamps) {
      columnNames.push(this.createdAtColumn)
      bindingValues.push('NOW()')
    }
    if (!columnNames.includes(this.updatedAtColumn) && this.timestamps) {
      columnNames.push(this.updatedAtColumn)
      bindingValues.push('NOW()')
    }
    let sql = `
      INSERT INTO "${this.table}" ("${columnNames.join('", "')}")
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
      const columnName = this.automaticTransformColumn ? snakeCase(key) : key
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

    let sql = `UPDATE "${this.table}" `
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
      sql  = `UPDATE "${this.table}" `
      sql += `SET "${this.deletedAtColumn}" = NOW() `
      sql += `WHERE ${whereQry.join(' AND ')} `
      sql += `RETURNING *`
    } else {
      sql  = `DELETE FROM "${this.table}" `
      sql += `WHERE ${whereQry.join(' AND ')} `
      sql += `RETURNING *`
    }

    return Sql.execute(sql, sqlParams)
  }

  buildWhereQryAndParams (where = {}, whereQry = [], sqlParams = []) {
    Object.keys(where).map(key => {
      const columnName = this.automaticTransformColumn ? snakeCase(key) : key
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
