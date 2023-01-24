import { Pool } from "pg";
import {
  logDanger,
  logInfo,
  logMagenta,
} from "@insigniateam/helpers.print-log";
import Secret from "@insigniateam/rafael-data.secret";

interface DbCredentials {
  database: string;
  host: string;
  user: string;
  password: string;
  port: string;
}
let DB_CREDENTIALS: DbCredentials | undefined;

export default class Sql {
  static async setDbCredentials(credentials: DbCredentials) {
    DB_CREDENTIALS = credentials;
  }

  static async connectToDb() {
    const isDev = process.env.STAGE === "dev";
    const secret = await new Secret();
    if (!DB_CREDENTIALS) {
      throw new Error("DB_CREDENTIALS not set");
    }
    return new Pool({
      database: DB_CREDENTIALS.database,
      host: isDev ? DB_CREDENTIALS.host : secret.data.db.host,
      user: isDev ? DB_CREDENTIALS.user : secret.data.db.username,
      password: isDev ? DB_CREDENTIALS.password : secret.data.db.password,
      port: isDev ? DB_CREDENTIALS.port : secret.data.db.port,
    });
  }

  static async execute(query, params = []) {
    const db = await this.connectToDb();

    params = Array.isArray(params) ? params : [params];

    return db
      .query(query, params)
      .then((value) => {
        db.end();
        if (process.env.DB_DEBUG === "true") {
          logInfo("Running Query:");
          logMagenta(query);
          logMagenta(`Params: ${JSON.stringify(params)}`);
          logInfo(`${value.rows.length} rows returned.`);
        }
        return value.rows;
      })
      .catch((err) => {
        db.end();

        logDanger("Error When Running Query:");
        logMagenta(query);
        logMagenta(`Params: ${JSON.stringify(params)}`);

        const errMsg = `[SQL Error] ${
          err.message
        }. Query: ${query}. Params: ${JSON.stringify(params)}`;
        logDanger(errMsg);
        throw new Error(errMsg);
      });
  }
}
